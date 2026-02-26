import type { Context } from "@netlify/functions";
import {
  incrementByKey,
  isHumanOnAnySupportedChain,
  SHARD_COUNT,
  toUtcDayStart,
} from "../../src/utils/seerAnalytics";
import { createHash, randomUUID } from "node:crypto";
import { Address, isAddress } from "viem";

type TrackBody = {
  address?: string;
};

const runTrackJob = async (address: Address, requestId: string) => {
  const isHuman = await isHumanOnAnySupportedChain(address);
  if (!isHuman) return;

  const dayStart = toUtcDayStart(Math.floor(Date.now() / 1000));
  const salt = process.env.SEER_ANALYTICS_HASH_SALT;
  if (!salt) {
    console.error("[seer-analytics] missing salt", { requestId });
    return;
  }

  // compute hash to be used in HLL
  const dayHash = createHash("sha256")
    .update(`${salt}|${address.toLowerCase()}|${dayStart}`)
    .digest("hex");
  const allTimeHash = createHash("sha256")
    .update(`${salt}|${address.toLowerCase()}|all`)
    .digest("hex");
  // shard to allocate this hash to
  const dayShard = Number.parseInt(dayHash.slice(0, 8), 16) % SHARD_COUNT;
  const allTimeShard = Number.parseInt(allTimeHash.slice(0, 8), 16) % SHARD_COUNT;

  const isDayWritten = await incrementByKey(
    `seer-claim/${dayStart}/${dayShard}`,
    dayHash,
  );
  const isAllTimeWritten = await incrementByKey(
    `seer-claim/all/${allTimeShard}`,
    allTimeHash,
  );
  if (!isDayWritten || !isAllTimeWritten) {
    console.warn("[seer-analytics] write skipped after retries", { requestId });
  }
};

export default async (request: Request, context: Context) => {
  const requestId = randomUUID();
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    console.warn("[seer-analytics] invalid method", { requestId, method: request.method });
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    console.warn("[seer-analytics] invalid json body", { requestId });
    return new Response(null, { status: 400, headers: corsHeaders });
  }
  const { address } = body;

  if (!address || !isAddress(address)) {
    console.warn("[seer-analytics] invalid address payload", { requestId });
    return new Response(null, { status: 400, headers: corsHeaders });
  }

  const trackPromise = runTrackJob(address, requestId).catch(
    (error) => {
      console.error("[seer-analytics] track job failed", {
        requestId,
        message: error instanceof Error ? error.message : String(error),
      });
    },
  );

  const waitUntilContext = context as Context & {
    waitUntil?: (promise: Promise<unknown>) => void;
  };
  if (waitUntilContext.waitUntil) {
    waitUntilContext.waitUntil(trackPromise);
  } else {
    await trackPromise;
  }

  return new Response(null, { status: 204, headers: corsHeaders });
};
