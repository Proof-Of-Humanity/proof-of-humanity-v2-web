"use client";

import { useEffect, useState } from "react";
import {
  getChainRpc,
  supportedChains,
  type SupportedChainId,
} from "config/chains";
import { subgraph_url } from "config/subgraph";
import { createPublicClient, http } from "viem";

type SubgraphHealth = {
  chainLabel: string;
  chainId: SupportedChainId;
  ok: boolean;
  hasIndexingErrors: boolean;
  unreachable: boolean;
  blockLag?: number;
};

const META_QUERY = `query { _meta { hasIndexingErrors block { number } } }`;
const REFRESH_INTERVAL_MS = 60_000;
const ROTATION_INTERVAL_MS = 3_200;
const BLOCK_LAG_THRESHOLD = 2_000;

async function getLatestBlock(chainId: SupportedChainId) {
  const client = createPublicClient({
    transport: http(getChainRpc(chainId)),
  });
  return Number(await client.getBlockNumber());
}

async function probeSubgraph(
  chainLabel: string,
  chainId: SupportedChainId,
  url: string,
): Promise<SubgraphHealth> {
  const baseStatus = { chainLabel, chainId };

  try {
    const [res, latestBlock] = await Promise.all([
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: META_QUERY }),
        cache: "no-store",
      }),
      getLatestBlock(chainId).catch(() => undefined),
    ]);

    if (!res.ok) {
      return {
        ...baseStatus,
        ok: false,
        hasIndexingErrors: false,
        unreachable: true,
      };
    }
    const json = (await res.json()) as {
      data?: {
        _meta?: { hasIndexingErrors?: boolean; block?: { number?: number } };
      };
    };
    const hasIndexingErrors = Boolean(json.data?._meta?.hasIndexingErrors);
    const unreachable = !json.data?._meta;
    const indexedBlock = json.data?._meta?.block?.number;
    const blockLag =
      latestBlock !== undefined && indexedBlock !== undefined
        ? Math.max(latestBlock - indexedBlock, 0)
        : undefined;
    const hasBlockLag =
      blockLag !== undefined && blockLag > BLOCK_LAG_THRESHOLD;

    return {
      ...baseStatus,
      ok: !hasIndexingErrors && !unreachable && !hasBlockLag,
      hasIndexingErrors,
      unreachable,
      blockLag,
    };
  } catch {
    return {
      ...baseStatus,
      ok: false,
      hasIndexingErrors: false,
      unreachable: true,
    };
  }
}

const getLagLabel = (status: SubgraphHealth) =>
  status.blockLag !== undefined
    ? `${status.blockLag.toLocaleString()} blocks behind`
    : "Block lag unavailable";

const getStatusLabel = (status: SubgraphHealth) =>
  status.unreachable
    ? "Unreachable"
    : status.hasIndexingErrors
      ? "Indexing errors"
      : status.ok
        ? null
        : "High block lag";

const getDotClassName = (status: SubgraphHealth) =>
  status.ok
    ? "bg-[#48E39A] shadow-[0_0_14px_rgba(72,227,154,0.75)]"
    : "bg-[#FF4D5E] shadow-[0_0_14px_rgba(255,77,94,0.75)]";

const getStatusDescription = (status: SubgraphHealth) =>
  [
    status.ok ? "Healthy" : "Degraded",
    getStatusLabel(status),
    getLagLabel(status),
  ]
    .filter(Boolean)
    .join(" · ");

export default function SubgraphsStatus() {
  const [statuses, setStatuses] = useState<SubgraphHealth[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const targets = supportedChains.map((chain) => ({
      chainLabel: chain.name,
      chainId: chain.id,
      url: subgraph_url[chain.id],
    }));

    const run = async () => {
      const results = await Promise.all(
        targets.map((t) => probeSubgraph(t.chainLabel, t.chainId, t.url)),
      );
      if (cancelled) return;
      setStatuses(results);
    };

    run();
    const id = setInterval(run, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const visibleStatuses = statuses.some((status) => !status.ok) ? statuses : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [visibleStatuses.length]);

  useEffect(() => {
    if (visibleStatuses.length <= 1) return;

    const id = setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleStatuses.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(id);
  }, [visibleStatuses.length]);

  const [firstStatus] = visibleStatuses;
  if (!firstStatus) return null;

  const activeStatus = visibleStatuses[activeIndex] ?? firstStatus;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${activeStatus.chainLabel} subgraph status: ${
        activeStatus.ok ? "healthy" : "degraded"
      }: ${getStatusDescription(activeStatus)}.`}
      className="sticky top-0 z-30 mb-4 overflow-hidden rounded-input border border-[rgba(255,138,102,0.28)] bg-white dark:bg-[#292D35] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div
        aria-hidden="true"
        className="flex transition-transform duration-500 ease-premium"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {visibleStatuses.map((status, index) => (
          <div
            key={status.chainId}
            className="flex min-w-full items-center justify-center gap-3 px-4 py-2.5 text-center"
          >
            <span
              className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${getDotClassName(
                status,
              )}`}
            />
            <h2 className="m-0 whitespace-nowrap text-sm font-semibold leading-6 text-[#292D35] dark:text-white sm:text-base">
              {status.chainLabel} subgraph status
            </h2>
            <span className="hidden h-4 border-l border-[#292D35]/25 dark:border-white/35 sm:block" />
            <p className="m-0 min-w-0 truncate text-xs text-[#292D35]/85 dark:text-white/90 sm:text-sm">
              {getStatusDescription(status)}
            </p>
            {visibleStatuses.length > 1 ? (
              <span className="rounded-full bg-black/8 px-2 py-0.5 text-xs font-semibold text-[#292D35] dark:bg-white/15 dark:text-white">
                {index + 1}/{visibleStatuses.length}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
