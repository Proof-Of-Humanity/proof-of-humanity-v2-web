import { getChainRpc, idToChain, SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts/registry";
import { cache } from "react";
import { createPublicClient, erc20Abi, http } from "viem";
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
  KLEROSBOARD_GNOSIS: "https://api.studio.thegraph.com/query/66145/klerosboard-gnosis/version/latest",
  CLAIM_MODAL_RAW_URL: "https://raw.githubusercontent.com/kleros/court/master/src/components/claim-modal.js",
  IPFS_CDN_BASE: "https://cdn.kleros.link/ipfs",
} as const;

// Configuration constants
const CONFIG = {
  GNOSIS_REWARD_SPLIT: 0.1, // 10% to Gnosis, 90% to Mainnet
  KIP66_START_DATE: new Date(2023, 11, 1),
  KIP66_INITIAL_TARGET: 0.28,
  KIP66_MONTHLY_INCREMENT: 0.01,
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


export const getHumanitySubCourtId = (chainId: SupportedChainId): bigint => {
  return chainId === 100 ? COURT_IDS.GNOSIS_HUMANITY_SUBCOURT_ID : COURT_IDS.CHIADO_HUMANITY_SUBCOURT_ID;
};

/**
 * Gets the court fee for jurors in the humanity subcourt for a given chain
 */
export const getHumanityCourtFeeForJuror = cache(async (chainId: SupportedChainId): Promise<bigint> => {
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
      transport: http(getChainRpc(chain.id)),
    });
    const courtId = chainId === 100 
      ? COURT_IDS.GNOSIS_HUMANITY_SUBCOURT_ID 
      : COURT_IDS.CHIADO_HUMANITY_SUBCOURT_ID;
    const court = await publicClient.readContract({
      address: liquidInfo.address as `0x${string}`,
      abi: liquidInfo.abi,
      functionName: "courts",
      args: [courtId],
    });
    
    return court[4];
  }); 


/**
 * Calculates the KIP-66 target based on elapsed months since start date
 */
function getKip66Target(): number {
  const now = new Date();
  let months = (now.getFullYear() - CONFIG.KIP66_START_DATE.getFullYear()) * 12 
    - CONFIG.KIP66_START_DATE.getMonth() + now.getMonth();
  months = Math.max(0, months);
  
  const target = CONFIG.KIP66_INITIAL_TARGET + months * CONFIG.KIP66_MONTHLY_INCREMENT;
  return Math.min(target, CONFIG.KIP66_MAX_TARGET);
}

/**
 * Gets the previous month and year from a given date
 */
function getPreviousMonthAndYear(date = new Date()): MonthYear {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  
  const { month, year } = currentMonth === 0 
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
  const res = await fetch(API_ENDPOINTS.CLAIM_MODAL_RAW_URL);
  const source = await res.text();

  const buildUrls = (m: string, y: string): string[] => {
    const reg = new RegExp(
      `"(?<cid>[a-zA-Z0-9]*)/(?<file>(?:snapshot|xdai-snapshot)-${y}-${m}\\.json)"`, 
      "g"
    );
    const matches = Array.from(source.matchAll(reg));
    return matches.map((r) => `${API_ENDPOINTS.IPFS_CDN_BASE}/${r.groups?.cid}/${r.groups?.file}`);
  };

  let urls = buildUrls(month, year);
  if (urls.length === 0) {
    const prev = getPreviousMonthAndYear(new Date(Number(year), Number(month) - 1, 1));
    urls = buildUrls(prev.month, prev.year);
  }

  let lastMonthReward = 0n;
  for (const url of urls) {
    try {
      const json = await (await fetch(url)).json() as SnapshotData;
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
    const data = await res.json() as KlerosGraphResponse;
    const weiStr = data?.data?.klerosCounters?.[0]?.tokenStaked;
    
    if (typeof weiStr === "string") {
      return Number(BigInt(weiStr)) / CONFIG.TOKEN_DECIMALS;
    }
  } catch {
    // Fallback to snapshot data below
  }

  // Fallback to snapshot data
  const claimModalSrc = await (await fetch(API_ENDPOINTS.CLAIM_MODAL_RAW_URL)).text();
  
  const tryMonth = async (m: string, y: string): Promise<number | null> => {
    const reg = new RegExp(`"(?<cid>[a-zA-Z0-9]*)/xdai-snapshot-${y}-${m}\\.json"`, "g");
    const matches = Array.from(claimModalSrc.matchAll(reg));
    
    for (const match of matches) {
      const url = `${API_ENDPOINTS.IPFS_CDN_BASE}/${match.groups?.cid}/xdai-snapshot-${y}-${m}.json`;
      try {
        const json = await (await fetch(url)).json() as SnapshotData;
        const hex = json?.averageTotalStaked?.hex;
        if (hex) {
          return Number(BigInt(hex)) / CONFIG.TOKEN_DECIMALS;
        }
      } catch {
        continue;
      }
    }
    return null;
  };

  // Try current month first, then previous month
  const { month, year } = getPreviousMonthAndYear();
  let staked = await tryMonth(month, year);
  if (staked !== null) return staked;

  const prev = getPreviousMonthAndYear(new Date(Number(year), Number(month) - 1, 1));
  staked = await tryMonth(prev.month, prev.year);
  if (staked !== null) return staked;

  throw new Error("Could not fetch total staked for Gnosis");
}

/**
 * Calculates the actual PNK supply (total supply minus coop multisig balance)
 */
async function getActualPnkSupply(): Promise<number> {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(getChainRpc(mainnet.id)),
  });
  
  const [totalSupply, coopBalance] = await Promise.all([
    publicClient.readContract({ 
      address: CONTRACTS.PNK_MAINNET_ADDRESS, 
      abi: erc20Abi, 
      functionName: "totalSupply" 
    }),
    publicClient.readContract({ 
      address: CONTRACTS.PNK_MAINNET_ADDRESS, 
      abi: erc20Abi, 
      functionName: "balanceOf", 
      args: [CONTRACTS.COOP_MULTISIG] 
    }),
  ]);
  
  const actualSupplyWei = (totalSupply as bigint) - (coopBalance as bigint);
  return Number(actualSupplyWei) / CONFIG.TOKEN_DECIMALS;
}

/**
 * Computes the APY for PNK staking on Gnosis chain based on KIP-66
 * @returns The APY as a percentage
 */
export async function computeGnosisAPY(): Promise<number> {
  const [totalStaked, lastMonthReward, actualSupply] = await Promise.all([
    getTotalStakedOnGnosis(),
    getLastMonthReward(),
    getActualPnkSupply(),
  ]);

  if (!totalStaked || totalStaked <= 0) {
    return 0;
  }

  const target = getKip66Target();
  const currentStakedRate = totalStaked / actualSupply;
  const chainReward = CONFIG.GNOSIS_REWARD_SPLIT * lastMonthReward * (1 + target - currentStakedRate);
  
  return (chainReward / totalStaked) * CONFIG.MONTHS_PER_YEAR * CONFIG.PERCENTAGE_MULTIPLIER;
}