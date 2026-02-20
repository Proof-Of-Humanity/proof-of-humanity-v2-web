import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { ChainSet, configSetSelection } from "../contracts/config";
import { getContractInfo } from "../contracts/registry";
import { Address, createPublicClient, http, isAddress } from "viem";
import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

const STORE_NAME = "analytics";
const DAY_SECONDS = 86_400;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 25;
const RETRY_JITTER_MS = 75;
export const SHARD_COUNT = 4;

// Use 2^10 registers (1024) for ~3.25% std error.
const HLL_PRECISION = 10;
const HLL_REGISTERS = 1 << HLL_PRECISION;
const TWO_POW_32 = Math.pow(2, 32);

type SeerHll = {
  version: 2;
  precision: number;
  registers: number[];
};

type LegacyHll = {
  type?: string;
  _nbRegisters?: number;
  _registers?: number[];
};

type AnalyticsBlob = {
  hll: unknown;
};

const MAINNET_CHAINS = [
  { chain: mainnet, rpcEnv: "MAINNET_RPC" },
  { chain: gnosis, rpcEnv: "GNOSIS_RPC" },
] as const;

const TESTNET_CHAINS = [
  { chain: sepolia, rpcEnv: "SEPOLIA_RPC" },
  { chain: gnosisChiado, rpcEnv: "CHIADO_RPC" },
] as const;

export const toUtcDayStart = (unixSeconds: number) =>
  Math.floor(unixSeconds / DAY_SECONDS) * DAY_SECONDS;

export const getCorsHeaders = (): Record<string, string> => {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
};

const createEmptySketch = (): SeerHll => ({
  version: 2,
  precision: HLL_PRECISION,
  registers: Array.from({ length: HLL_REGISTERS }, () => 0),
});

const isLegacySketch = (value: unknown): value is LegacyHll => {
  if (!value || typeof value !== "object") return false;
  const maybe = value as LegacyHll;
  return (
    maybe.type === "HyperLogLog" &&
    typeof maybe._nbRegisters === "number" &&
    Array.isArray(maybe._registers)
  );
};

const isCurrentSketch = (value: unknown): value is SeerHll => {
  if (!value || typeof value !== "object") return false;
  const maybe = value as SeerHll;
  return (
    maybe.version === 2 &&
    typeof maybe.precision === "number" &&
    Array.isArray(maybe.registers)
  );
};

const loadSketch = (value: unknown): SeerHll => {
  if (isCurrentSketch(value)) {
    if (value.precision !== HLL_PRECISION) {
      return createEmptySketch();
    }

    if (value.registers.length !== HLL_REGISTERS) {
      return createEmptySketch();
    }

    return {
      version: 2,
      precision: HLL_PRECISION,
      registers: value.registers.map((v) => Number(v) || 0),
    };
  }

  if (isLegacySketch(value)) {
    if (value._nbRegisters !== HLL_REGISTERS || !value._registers) {
      return createEmptySketch();
    }

    if (value._registers.length !== HLL_REGISTERS) {
      return createEmptySketch();
    }

    return {
      version: 2,
      precision: HLL_PRECISION,
      registers: value._registers.map((v) => Number(v) || 0),
    };
  }

  return createEmptySketch();
};

const alphaForM = (m: number) => {
  if (m < 16) return 1;
  if (m < 32) return 0.673;
  if (m < 64) return 0.697;
  if (m < 128) return 0.709;
  return 0.7213 / (1.0 + 1.079 / m);
};

const hashTo64Bits = (value: string): bigint => {
  const digest = createHash("sha256").update(value).digest("hex");
  return BigInt(`0x${digest.slice(0, 16)}`);
};

const countLeadingZeros = (value: bigint, bitLength: number): number => {
  for (let i = bitLength - 1; i >= 0; i -= 1) {
    if (((value >> BigInt(i)) & 1n) === 1n) {
      return bitLength - 1 - i;
    }
  }

  return bitLength;
};

const updateSketch = (sketch: SeerHll, element: string) => {
  const hash64 = hashTo64Bits(element);
  const remainingBits = 64 - sketch.precision;

  const registerIndex = Number(
    hash64 >> BigInt(64 - sketch.precision),
  );
  const remainingMask = (1n << BigInt(remainingBits)) - 1n;
  const remainder = hash64 & remainingMask;

  // HLL rho(w): position of first 1 bit in remainder + 1.
  const rho = countLeadingZeros(remainder, remainingBits) + 1;
  sketch.registers[registerIndex] = Math.max(sketch.registers[registerIndex], rho);
};

const mergeSketches = (left: SeerHll, right: SeerHll): SeerHll => {
  const merged = createEmptySketch();
  for (let i = 0; i < HLL_REGISTERS; i += 1) {
    merged.registers[i] = Math.max(left.registers[i], right.registers[i]);
  }

  return merged;
};

const estimateSketch = (sketch: SeerHll): number => {
  const m = HLL_REGISTERS;
  const alpha = alphaForM(m);
  const z = sketch.registers.reduce((acc, value) => acc + Math.pow(2, -value), 0);
  const raw = (alpha * m * m) / z;

  if (raw <= (5 / 2) * m) {
    const zeroCount = sketch.registers.filter((value) => value === 0).length;
    if (zeroCount > 0) {
      return m * Math.log(m / zeroCount);
    }

    return raw;
  }

  if (raw <= TWO_POW_32 / 30) {
    return raw;
  }

  return -TWO_POW_32 * Math.log(1 - raw / TWO_POW_32);
};

export const incrementByKey = async (key: string, hashedAddress: string) => {
  const store = getStore(STORE_NAME);
  console.info("[seer-analytics] increment start", {
    key,
    hashedAddress,
    maxRetries: MAX_RETRIES,
  });

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    console.info("[seer-analytics] increment attempt", { key, hashedAddress, attempt });
    const current = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    console.info("[seer-analytics] increment current state", {
      key,
      attempt,
      exists: Boolean(current),
      etag: current?.etag || null,
    });
    const currentData = current?.data as AnalyticsBlob | undefined;
    const sketch = loadSketch(currentData?.hll);

    updateSketch(sketch, hashedAddress);

    const next: AnalyticsBlob = {
      hll: sketch,
    };

    const result = current
      ? await store.setJSON(key, next, { onlyIfMatch: current.etag })
      : await store.setJSON(key, next, { onlyIfNew: true });
    console.info("[seer-analytics] increment write result", {
      key,
      attempt,
      modified: result.modified,
    });

    if (result.modified) return true;

    const delay =
      RETRY_BASE_DELAY_MS + Math.floor(Math.random() * RETRY_JITTER_MS);
    console.warn("[seer-analytics] increment retry scheduled", {
      key,
      attempt,
      delay,
    });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.error("[seer-analytics] increment failed after retries", { key, hashedAddress });
  return false;
};

export const getMetricsRangeTotal = async (
  startDay: number,
  endDay: number,
) => {
  console.info("[seer-analytics] get range total start", { startDay, endDay });
  const store = getStore(STORE_NAME);
  const dayStarts: number[] = [];

  for (let day = startDay; day <= endDay; day += DAY_SECONDS) {
    dayStarts.push(day);
  }
  console.info("[seer-analytics] get range day list", { dayStarts });

  const shardReads: Promise<{ day: number; value: AnalyticsBlob | null }>[] = [];
  for (const day of dayStarts) {
    for (let shard = 0; shard < SHARD_COUNT; shard += 1) {
      shardReads.push(
        store.get(`seer-claim/${day}/${shard}`, { type: "json" })
          .then((value) => ({ day, value: value as AnalyticsBlob | null })),
      );
    }
  }
  const results = await Promise.all(shardReads);
  console.info("[seer-analytics] get range shard reads complete", {
    readCount: results.length,
  });
  const mergedByDay = new Map<number, SeerHll>();

  for (const { day, value } of results) {
    if (!value?.hll) continue;
    const sketch = loadSketch(value.hll);
    const current = mergedByDay.get(day);
    mergedByDay.set(day, current ? mergeSketches(current, sketch) : sketch);
  }

  let totalUniqueEstimate = 0;
  for (const day of dayStarts) {
    const dayEstimate = estimateSketch(mergedByDay.get(day) || createEmptySketch());
    console.info("[seer-analytics] get range day estimate", { day, dayEstimate });
    totalUniqueEstimate += dayEstimate;
  }

  console.info("[seer-analytics] get range total done", { totalUniqueEstimate });
  return totalUniqueEstimate;
};

export const getAllTimeUniqueEstimate = async () => {
  console.info("[seer-analytics] get all-time start");
  const store = getStore(STORE_NAME);
  let merged: SeerHll | null = null;

  for (let shard = 0; shard < SHARD_COUNT; shard += 1) {
    const value = (await store.get(`seer-claim/all/${shard}`, {
      type: "json",
    })) as AnalyticsBlob | null;
    if (!value?.hll) {
      console.info("[seer-analytics] get all-time shard empty", { shard });
      continue;
    }
    console.info("[seer-analytics] get all-time shard loaded", { shard });
    const sketch = loadSketch(value.hll);

    if (!merged) {
      merged = sketch;
    } else {
      merged = mergeSketches(merged, sketch);
    }
  }

  const uniqueEstimate = merged ? estimateSketch(merged) : 0;
  console.info("[seer-analytics] get all-time done", { uniqueEstimate });
  return uniqueEstimate;
};

export const isHumanOnAnySupportedChain = async (address: Address) => {
  if (!address || !isAddress(address)) {
    console.warn("[seer-analytics] isHuman invalid address", { address });
    return false;
  }
  const chainConfigs =
    configSetSelection.chainSet === ChainSet.MAINNETS
      ? MAINNET_CHAINS
      : TESTNET_CHAINS;
  console.info("[seer-analytics] isHuman start", {
    address,
    chainIds: chainConfigs.map(({ chain }) => chain.id),
  });

  const checks = chainConfigs.map(async ({ chain, rpcEnv }) => {
    try {
      const rpc = process.env[rpcEnv];
      if (!rpc) {
        console.warn("[seer-analytics] isHuman missing rpc", { address, chainId: chain.id, rpcEnv });
        return false;
      }

      const contract = getContractInfo("ProofOfHumanity", chain.id);
      if (!contract.address) {
        console.warn("[seer-analytics] isHuman missing contract", { address, chainId: chain.id });
        return false;
      }

      const client = createPublicClient({
        chain,
        transport: http(rpc),
      });

      const isHuman = await client.readContract({
        abi: contract.abi,
        address: contract.address,
        functionName: "isHuman",
        args: [address],
      });
      console.info("[seer-analytics] isHuman chain result", {
        address,
        chainId: chain.id,
        isHuman: Boolean(isHuman),
      });

      return Boolean(isHuman);
    } catch (error) {
      console.error("[seer-analytics] isHuman chain error", {
        address,
        chainId: chain.id,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  });

  const results = await Promise.all(checks);
  const finalResult = results.some(Boolean);
  console.info("[seer-analytics] isHuman final", { address, finalResult });
  return finalResult;
};
