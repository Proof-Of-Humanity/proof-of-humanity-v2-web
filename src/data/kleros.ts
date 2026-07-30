import { getChainTransport, idToChain, SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts/registry";
import { cache } from "react";
import { createPublicClient, erc20Abi } from "viem";
import { mainnet } from "viem/chains";

// Court configuration constants
const COURT_IDS = {
  GNOSIS_HUMANITY_SUBCOURT_ID: 18n,
  CHIADO_HUMANITY_SUBCOURT_ID: 0n,
} as const;

// Contract addresses and API endpoints
const CONTRACTS = {
  PNK_MAINNET_ADDRESS: "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d" as const,
  COOP_MULTISIG: "0x67a57535b11445506a9e340662cd0c9755e5b1b4" as const,
} as const;

const API_ENDPOINTS = {
  KLEROSBOARD_GNOSIS:
    "https://api.studio.thegraph.com/query/66145/klerosboard-gnosis/version/latest",
  KLEROSBOARD_MAINNET:
    "https://api.studio.thegraph.com/query/66145/klerosboard-mainnet/version/latest",
  // Published by kleros/court: the monthly reward snapshot CIDs, keyed by chain id.
  SNAPSHOTS_URL: "https://court.kleros.io/snapshots.json",
  IPFS_CDN_BASE: "https://cdn.kleros.link/ipfs",
} as const;

// Configuration constants
const CONFIG = {
  GNOSIS_REWARD_SPLIT: 0.1, // 10% to Gnosis, 90% to Mainnet
  KIP66_START_DATE: new Date(2025, 8, 1),
  KIP66_INITIAL_TARGET: 0.33,
  KIP66_MONTHLY_INCREMENT: 0.002,
  KIP66_MAX_TARGET: 0.5,
  TOKEN_DECIMALS: 1e18,
  MONTHS_PER_YEAR: 12,
  PERCENTAGE_MULTIPLIER: 100,
} as const;

// TypeScript interfaces
interface MonthYear {
  month: string;
  year: string;
}

interface KlerosGraphResponse {
  data?: {
    klerosCounters?: Array<{
      tokenStaked: string;
    }>;
  };
}

interface SnapshotData {
  totalClaimable?: {
    hex: string;
  };
  averageTotalStaked?: {
    hex: string;
  };
}

type SnapshotsByChainId = Record<"1" | "100", string[]>;

/**
 * Fetches the snapshot manifest published by kleros/court.
 *
 * court.kleros.io answers unknown paths with index.html and a 200, so the shape of the
 * body — not response.ok — is what tells us we really got the manifest.
 */
const fetchSnapshots = cache(async (): Promise<SnapshotsByChainId> => {
  const res = await fetch(API_ENDPOINTS.SNAPSHOTS_URL);
  const snapshots = await res.json();

  if (!Array.isArray(snapshots?.["1"]) || !Array.isArray(snapshots?.["100"])) {
    throw new Error(
      `${API_ENDPOINTS.SNAPSHOTS_URL} did not return a snapshot manifest`,
    );
  }

  return snapshots as SnapshotsByChainId;
});

/**
 * Finds a chain's snapshot for a given month. Entries look like
 * "<cid>/snapshot-2026-06.json" or "<cid>/xdai-snapshot-2026-06.json"; the leading
 * slash matters, since "xdai-snapshot-..." also ends with the mainnet name.
 */
function findSnapshotPath(
  paths: string[],
  prefix: "snapshot" | "xdai-snapshot",
  { month, year }: MonthYear,
): string | undefined {
  return paths.find((path) =>
    path.endsWith(`/${prefix}-${year}-${month}.json`),
  );
}

export const getHumanitySubCourtId = (chainId: SupportedChainId): bigint => {
  return chainId === 100
    ? COURT_IDS.GNOSIS_HUMANITY_SUBCOURT_ID
    : COURT_IDS.CHIADO_HUMANITY_SUBCOURT_ID;
};

/**
 * Gets the court fee for jurors in the humanity subcourt for a given chain
 */
export const getHumanityCourtFeeForJuror = cache(
  async (chainId: SupportedChainId): Promise<bigint> => {
    const liquidInfo = getContractInfo("KlerosLiquid", chainId);
    if (!liquidInfo.address) {
      throw new Error(`KlerosLiquid not deployed on chain ${chainId}`);
    }

    const chain = idToChain(chainId);
    if (!chain) {
      throw new Error(`Unsupported chain ${chainId}`);
    }

    const publicClient = createPublicClient({
      chain,
      transport: getChainTransport(chain.id),
    });
    const courtId =
      chainId === 100
        ? COURT_IDS.GNOSIS_HUMANITY_SUBCOURT_ID
        : COURT_IDS.CHIADO_HUMANITY_SUBCOURT_ID;
    const court = await publicClient.readContract({
      address: liquidInfo.address as `0x${string}`,
      abi: liquidInfo.abi,
      functionName: "courts",
      args: [courtId],
    });

    return court[4];
  },
);

/**
 * Calculates the KIP-66 target based on elapsed months since start date
 */
function getKip66Target(): number {
  const now = new Date();
  let months =
    (now.getFullYear() - CONFIG.KIP66_START_DATE.getFullYear()) * 12 -
    CONFIG.KIP66_START_DATE.getMonth() +
    now.getMonth();
  months = Math.max(0, months);

  const target =
    CONFIG.KIP66_INITIAL_TARGET + months * CONFIG.KIP66_MONTHLY_INCREMENT;
  return Math.min(target, CONFIG.KIP66_MAX_TARGET);
}

/**
 * Gets the previous month and year from a given date
 */
function getPreviousMonthAndYear(date = new Date()): MonthYear {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const { month, year } =
    currentMonth === 0
      ? { month: 12, year: currentYear - 1 }
      : { month: currentMonth, year: currentYear };

  return {
    month: month < 10 ? `0${month}` : month.toString(),
    year: year.toString(),
  };
}

/**
 * Fetches the last month's reward data from Kleros snapshots
 */
async function getLastMonthReward(): Promise<number> {
  const { month, year } = getPreviousMonthAndYear();
  const snapshots = await fetchSnapshots();

  const buildUrls = (monthYear: MonthYear): string[] =>
    [
      findSnapshotPath(snapshots["1"], "snapshot", monthYear),
      findSnapshotPath(snapshots["100"], "xdai-snapshot", monthYear),
    ]
      .filter((path): path is string => path !== undefined)
      .map((path) => `${API_ENDPOINTS.IPFS_CDN_BASE}/${path}`);

  let urls = buildUrls({ month, year });
  if (urls.length === 0) {
    const prev = getPreviousMonthAndYear(
      new Date(Number(year), Number(month) - 1, 1),
    );
    urls = buildUrls(prev);
  }

  let lastMonthReward = 0n;
  for (const url of urls) {
    try {
      const json = (await (await fetch(url)).json()) as SnapshotData;
      const hex = json?.totalClaimable?.hex;
      if (hex) {
        lastMonthReward += BigInt(hex);
      }
    } catch {
      continue;
    }
  }

  return Number(lastMonthReward) / CONFIG.TOKEN_DECIMALS;
}

/**
 * Fetches the total amount of PNK staked on Gnosis chain
 */
async function getTotalStakedOnGnosis(): Promise<number> {
  // Try GraphQL API first
  try {
    const res = await fetch(API_ENDPOINTS.KLEROSBOARD_GNOSIS, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{ klerosCounters { tokenStaked } }" }),
    });
    const data = (await res.json()) as KlerosGraphResponse;
    const weiStr = data?.data?.klerosCounters?.[0]?.tokenStaked;

    if (typeof weiStr === "string") {
      return Number(BigInt(weiStr)) / CONFIG.TOKEN_DECIMALS;
    }
  } catch {
    // Fallback to snapshot data below
  }

  // Fallback to snapshot data
  const snapshots = await fetchSnapshots();

  const tryMonth = async (monthYear: MonthYear): Promise<number | null> => {
    const path = findSnapshotPath(snapshots["100"], "xdai-snapshot", monthYear);
    if (!path) return null;

    const url = `${API_ENDPOINTS.IPFS_CDN_BASE}/${path}`;
    try {
      const json = (await (await fetch(url)).json()) as SnapshotData;
      const hex = json?.averageTotalStaked?.hex;
      if (hex) {
        return Number(BigInt(hex)) / CONFIG.TOKEN_DECIMALS;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Try current month first, then previous month
  const { month, year } = getPreviousMonthAndYear();
  let staked = await tryMonth({ month, year });
  if (staked !== null) return staked;

  const prev = getPreviousMonthAndYear(
    new Date(Number(year), Number(month) - 1, 1),
  );
  staked = await tryMonth(prev);
  if (staked !== null) return staked;

  throw new Error("Could not fetch total staked for Gnosis");
}

/**
 * Fetches the total amount of PNK staked on Mainnet
 */
async function getTotalStakedOnMainnet(): Promise<number> {
  // Try GraphQL API first
  try {
    const res = await fetch(API_ENDPOINTS.KLEROSBOARD_MAINNET, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{ klerosCounters { tokenStaked } }" }),
    });
    const data = (await res.json()) as KlerosGraphResponse;
    const weiStr = data?.data?.klerosCounters?.[0]?.tokenStaked;

    if (typeof weiStr === "string") {
      return Number(BigInt(weiStr)) / CONFIG.TOKEN_DECIMALS;
    }
  } catch {
    // Fallback to snapshot data below
  }

  // Fallback to snapshot data
  const snapshots = await fetchSnapshots();

  const tryMonth = async (monthYear: MonthYear): Promise<number | null> => {
    const path = findSnapshotPath(snapshots["1"], "snapshot", monthYear);
    if (!path) return null;

    const url = `${API_ENDPOINTS.IPFS_CDN_BASE}/${path}`;
    try {
      const json = (await (await fetch(url)).json()) as SnapshotData;
      const hex = json?.averageTotalStaked?.hex;
      if (hex) {
        return Number(BigInt(hex)) / CONFIG.TOKEN_DECIMALS;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Try current month first, then previous month
  const { month, year } = getPreviousMonthAndYear();
  let staked = await tryMonth({ month, year });
  if (staked !== null) return staked;

  const prev = getPreviousMonthAndYear(
    new Date(Number(year), Number(month) - 1, 1),
  );
  staked = await tryMonth(prev);
  if (staked !== null) return staked;

  throw new Error("Could not fetch total staked for Mainnet");
}

/**
 * Fetches the total amount of PNK staked across Mainnet and Gnosis
 */
async function getTotalStakedAllChains(): Promise<number> {
  const [mainnet, gnosis] = await Promise.all([
    getTotalStakedOnMainnet().catch(() => 0),
    getTotalStakedOnGnosis().catch(() => 0),
  ]);
  return mainnet + gnosis;
}

// (removed) getActualPnkSupply to match script behavior: we use totalSupply without deductions

/**
 * Fetches the total PNK supply (matches script behavior: no coop deduction)
 */
async function getTotalPnkSupply(): Promise<number> {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: getChainTransport(mainnet.id),
  });

  const totalSupply = await publicClient.readContract({
    address: CONTRACTS.PNK_MAINNET_ADDRESS,
    abi: erc20Abi,
    functionName: "totalSupply",
  });

  return Number(totalSupply as bigint) / CONFIG.TOKEN_DECIMALS;
}

/**
 * Computes the APY for PNK staking on Gnosis chain based on KIP-66
 * @returns The APY as a percentage
 */
export async function computeGnosisAPY(): Promise<number> {
  const [totalSupply, totalStakedAllChains, lastMonthReward, gnosisStaked] =
    await Promise.all([
      getTotalPnkSupply(),
      getTotalStakedAllChains(),
      getLastMonthReward(),
      getTotalStakedOnGnosis(),
    ]);

  const target = getKip66Target();
  const currentStakedRate = totalStakedAllChains / totalSupply;
  const chainReward =
    CONFIG.GNOSIS_REWARD_SPLIT *
    lastMonthReward *
    (1 + target - currentStakedRate);

  return (
    (chainReward / gnosisStaked) *
    CONFIG.MONTHS_PER_YEAR *
    CONFIG.PERCENTAGE_MULTIPLIER
  );
}
