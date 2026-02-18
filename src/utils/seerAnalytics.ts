import { getStore } from "@netlify/blobs";
import { HyperLogLog } from "bloom-filters";
import { supportedChains, getChainRpc } from "../config/chains";
import { getContractInfo } from "../contracts/registry";
import { Address, createPublicClient, http, isAddress } from "viem";

const STORE_NAME = "analytics";
const DAY_SECONDS = 86_400;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 25;
const RETRY_JITTER_MS = 75;
export const SHARD_COUNT = 4;
const HLL_REGISTERS = 1024;
const ALLOWED_ORIGINS: string[] = [
  "https://frabjous-marigold-8334d9.netlify.app",
];

type AnalyticsBlob = {
  hll: unknown;
};

export const toUtcDayStart = (unixSeconds: number) =>
  Math.floor(unixSeconds / DAY_SECONDS) * DAY_SECONDS;

export const isOriginAllowed = (origin: string | null) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.includes(origin);
};

export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

export const incrementByKey = async (key: string, hashedAddress: string) => {
  const store = getStore(STORE_NAME);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const current = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const currentData = current?.data as AnalyticsBlob | undefined;
    const hll = currentData?.hll
      ? HyperLogLog.fromJSON(currentData.hll as any)
      : new HyperLogLog(HLL_REGISTERS);

    hll.update(hashedAddress);

    const next: AnalyticsBlob = {
      hll: hll.saveAsJSON(),
    };

    const result = current
      ? await store.setJSON(key, next, { onlyIfMatch: current.etag })
      : await store.setJSON(key, next, { onlyIfNew: true });

    if (result.modified) return true;

    const delay =
      RETRY_BASE_DELAY_MS + Math.floor(Math.random() * RETRY_JITTER_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

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
    const hll = HyperLogLog.fromJSON(value.hll as any);
    const current = mergedByDay.get(day);
    mergedByDay.set(day, current ? current.merge(hll) : hll);
  }

  let totalUniqueEstimate = 0;
  for (const day of dayStarts) {
    totalUniqueEstimate += mergedByDay.get(day)?.count() || 0;
  }

  return totalUniqueEstimate;
};

export const getAllTimeUniqueEstimate = async () => {
  const store = getStore(STORE_NAME);
  let merged: HyperLogLog | null = null;

  //merge all the shards to get the final HLL
  for (let shard = 0; shard < SHARD_COUNT; shard += 1) {
    const value = (await store.get(`seer-claim/all/${shard}`, {
      type: "json",
    })) as AnalyticsBlob | null;
    if (!value?.hll) continue;
    const hll = HyperLogLog.fromJSON(value.hll as any);

    if (!merged) {
      merged = hll;
    } else {
      merged = merged.merge(hll);
    }
  }

  return merged ? merged.count() : 0;
};

export const isHumanOnAnySupportedChain = async (address: Address) => {
  if (!address || !isAddress(address)) {
    return false;
  }
  const checks = supportedChains.map(async (chain) => {
    try {
      const client = createPublicClient({
        chain,
        transport: http(getChainRpc(chain.id)),
      });

      const isHuman = await client.readContract({
        abi: getContractInfo("ProofOfHumanity", chain.id).abi,
        address: getContractInfo("ProofOfHumanity", chain.id).address as `0x${string}`,
        functionName: "isHuman",
        args: [address],
      });

      return Boolean(isHuman);
    } catch {
      return false;
    }
  });

  return (await Promise.all(checks)).some(Boolean);
};
