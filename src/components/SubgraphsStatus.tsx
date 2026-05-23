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

/**
 * @dev Returns the latest RPC block for a supported chain.
 */
async function getLatestBlock(chainId: SupportedChainId) {
  const client = createPublicClient({
    transport: http(getChainRpc(chainId)),
  });
  return Number(await client.getBlockNumber());
}

/**
 * @dev Checks a subgraph's _meta status and compares its indexed block against
 * the chain head so the UI can surface unreachable, indexing, or lag issues.
 */
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

/**
 * @dev Formats the indexed-vs-RPC block lag for display.
 */
const getLagLabel = (status: SubgraphHealth) =>
  status.blockLag !== undefined
    ? `${status.blockLag.toLocaleString()} blocks behind`
    : "Block lag unavailable";

/**
 * @dev Returns the degraded reason, or null when the subgraph is healthy.
 */
const getStatusLabel = (status: SubgraphHealth) =>
  status.unreachable
    ? "Unreachable"
    : status.hasIndexingErrors
      ? "Indexing errors"
      : status.ok
        ? null
        : "High block lag";

/**
 * @dev Chooses the health indicator color classes for the status dot.
 */
const getDotClassName = (status: SubgraphHealth) =>
  status.ok
    ? "bg-[#48E39A] shadow-[0_0_14px_rgba(72,227,154,0.75)]"
    : "bg-[#FF4D5E] shadow-[0_0_14px_rgba(255,77,94,0.75)]";

/**
 * @dev Builds the compact status sentence shown in the carousel and aria label.
 */
const getStatusDescription = (status: SubgraphHealth) =>
  [
    status.ok ? "Healthy" : "Degraded",
    getStatusLabel(status),
    getLagLabel(status),
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * @dev Renders the subgraph health carousel only when at least one supported
 * chain subgraph is degraded.
 */
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

  if (visibleStatuses.length === 0) return null;

  const activeStatus = visibleStatuses[activeIndex] ?? visibleStatuses[0];
  if (!activeStatus) return null;

  const chainNames = unhealthy.map((s) => s.chainName);
  const chainList = formatChainList(chainNames);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${activeStatus.chainLabel} subgraph status: ${
        activeStatus.ok ? "healthy" : "degraded"
      }: ${getStatusDescription(activeStatus)}.`}
      className="sticky top-0 z-30 mb-4 overflow-hidden rounded-input border border-[rgba(255,138,102,0.28)] bg-[#292D35] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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
            <h2 className="m-0 whitespace-nowrap text-sm font-semibold leading-6 text-white sm:text-base">
              {status.chainLabel} subgraph status
            </h2>
            <span className="hidden h-4 border-l border-white/35 sm:block" />
            <p className="m-0 min-w-0 truncate text-xs text-white/90 sm:text-sm">
              {getStatusDescription(status)}
            </p>
            {visibleStatuses.length > 1 ? (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">
                {index + 1}/{visibleStatuses.length}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
