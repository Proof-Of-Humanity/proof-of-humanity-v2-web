import type { Context } from "@netlify/functions";
import {
  incrementByKey,
  SHARD_COUNT,
  toUtcDayStart,
} from "../../src/utils/seerAnalytics";
import { createHash, randomUUID } from "node:crypto";
import { Address, isAddress } from "viem";

type TrackBody = {
  address?: string;
};

const runTrackJob = async (address: Address, requestId: string) => {
  console.info("[seer-analytics] track start", { requestId, address });
  // const isHuman = await isHumanOnAnySupportedChain(address);
  // console.info("[seer-analytics] human check complete", { requestId, address, isHuman });
  // if (!isHuman) return;

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
  console.info("[seer-analytics] hashes prepared", {
    requestId,
    address,
    dayHash,
    allTimeHash,
  });

  // shard to allocate this hash to
  const dayShard = Number.parseInt(dayHash.slice(0, 8), 16) % SHARD_COUNT;
  const allTimeShard = Number.parseInt(allTimeHash.slice(0, 8), 16) % SHARD_COUNT;
  console.info("[seer-analytics] shard assignment", {
    requestId,
    dayStart,
    dayShard,
    allTimeShard,
  });

  const isDayWritten = await incrementByKey(
    `seer-claim/${dayStart}/${dayShard}`,
    dayHash,
  );
  const isAllTimeWritten = await incrementByKey(
    `seer-claim/all/${allTimeShard}`,
    allTimeHash,
  );
  console.info("[seer-analytics] write result", {
    requestId,
    isDayWritten,
    isAllTimeWritten,
  });
  if (!isDayWritten || !isAllTimeWritten) {
    console.warn("[seer-analytics] write skipped after retries", { requestId });
  }
};

export default async (request: Request, context: Context) => {
  const requestId = randomUUID();
  console.info("[seer-analytics] request received", {
    requestId,
    method: request.method,
    origin: request.headers.get("origin"),
  });
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    console.info("[seer-analytics] preflight", { requestId });
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
  console.info("[seer-analytics] request body parsed", { requestId, address });

  if (!address || !isAddress(address)) {
    console.warn("[seer-analytics] invalid address payload", { requestId });
    return new Response(null, { status: 400, headers: corsHeaders });
  }

  const trackPromise = runTrackJob(address, requestId).catch(
    (error) => {
      console.error("[seer-analytics] track job failed", {
        requestId,
        address,
        message: error instanceof Error ? error.message : String(error),
      });
    },
  );

  const waitUntilContext = context as Context & {
    waitUntil?: (promise: Promise<unknown>) => void;
  };
  if (waitUntilContext.waitUntil) {
    console.info("[seer-analytics] accepted async", { requestId });
    waitUntilContext.waitUntil(trackPromise);
  } else {
    console.info("[seer-analytics] accepted sync fallback", { requestId });
    await trackPromise;
  }

  return new Response(null, { status: 204, headers: corsHeaders });
};
