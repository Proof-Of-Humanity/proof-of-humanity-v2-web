import { getStore } from "@netlify/blobs";
import { ChainSet, configSetSelection } from "../contracts/config";
import { getContractInfo } from "../contracts/registry";
import { HyperLogLog } from "./hll";
import { Address, createPublicClient, http, isAddress } from "viem";
import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

const STORE_NAME = "analytics";
const DAY_SECONDS = 86_400;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 25;
const RETRY_JITTER_MS = 75;
export const SHARD_COUNT = 4;

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

export const incrementByKey = async (key: string, hashedAddress: string) => {
  const store = getStore(STORE_NAME);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const current = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const currentData = current?.data as AnalyticsBlob | undefined;
    const hll = new HyperLogLog(currentData?.hll);
    hll.add(hashedAddress);

    const next: AnalyticsBlob = {
      hll: hll.toSketch(),
    };

    const result = current
      ? await store.setJSON(key, next, { onlyIfMatch: current.etag })
      : await store.setJSON(key, next, { onlyIfNew: true });

    if (result.modified) return true;

    const delay =
      RETRY_BASE_DELAY_MS + Math.floor(Math.random() * RETRY_JITTER_MS);
    console.warn("[seer-analytics] increment retry scheduled", { key, attempt, delay });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.error("[seer-analytics] increment failed after retries", { key });
  return false;
};

export const getMetricsRangeTotal = async (
  startDay: number,
  endDay: number,
) => {
  const store = getStore(STORE_NAME);
  const dayStarts: number[] = [];

  for (let day = startDay; day <= endDay; day += DAY_SECONDS) {
    dayStarts.push(day);
  }

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
  const mergedByDay = new Map<number, HyperLogLog>();

  for (const { day, value } of results) {
    if (!value?.hll) continue;
    const sketch = new HyperLogLog(value.hll);
    const current = mergedByDay.get(day);
    mergedByDay.set(day, current ? current.merge(sketch) : sketch);
  }

  let totalUniqueEstimate = 0;
  for (const day of dayStarts) {
    const dayEstimate = mergedByDay.get(day)?.estimateCount() || 0;
    totalUniqueEstimate += dayEstimate;
  }

  return totalUniqueEstimate;
};

export const getAllTimeUniqueEstimate = async () => {
  const store = getStore(STORE_NAME);
  let merged: HyperLogLog | null = null;

  for (let shard = 0; shard < SHARD_COUNT; shard += 1) {
    const value = (await store.get(`seer-claim/all/${shard}`, {
      type: "json",
    })) as AnalyticsBlob | null;
    if (!value?.hll) continue;
    const sketch = new HyperLogLog(value.hll);

    if (!merged) {
      merged = sketch;
    } else {
      merged.merge(sketch);
    }
  }

  return merged ? merged.estimateCount() : 0;
};

export const isHumanOnAnySupportedChain = async (address: Address) => {
  if (!address || !isAddress(address)) {
    console.warn("[seer-analytics] isHuman invalid address payload");
    return false;
  }
  const chainConfigs =
    configSetSelection.chainSet === ChainSet.MAINNETS
      ? MAINNET_CHAINS
      : TESTNET_CHAINS;

  const checks = chainConfigs.map(async ({ chain, rpcEnv }) => {
    try {
      const rpc = process.env[rpcEnv];
      if (!rpc) {
        console.warn("[seer-analytics] isHuman missing rpc", { chainId: chain.id, rpcEnv });
        return false;
      }

      const contract = getContractInfo("ProofOfHumanity", chain.id);
      if (!contract.address) {
        console.warn("[seer-analytics] isHuman missing contract", { chainId: chain.id });
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

      return Boolean(isHuman);
    } catch (error) {
      console.error("[seer-analytics] isHuman chain error", {
        chainId: chain.id,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  });

  const results = await Promise.all(checks);
  return results.some(Boolean);
};
