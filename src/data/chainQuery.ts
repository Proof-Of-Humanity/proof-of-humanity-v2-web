import { SupportedChain, supportedChains } from "config/chains";
import { subgraph_url } from "config/subgraph";

/**
 * Thrown by `settleChainQueries` when *every* supported chain's query fails.
 * A partial outage never throws (live chains still render); this signals that
 * there is no live data source left, so pages should surface a real error
 * state rather than a misleading empty result.
 */
export class SubgraphUnavailableError extends Error {
  readonly reasons: unknown[];

  constructor(reasons: unknown[]) {
    super("All subgraphs are unavailable");
    this.name = "SubgraphUnavailableError";
    this.reasons = reasons;
  }
}

/**
 * Runs a query against every supported chain, tolerating per-chain failures.
 * A chain whose subgraph is down resolves to the provided fallback instead of
 * rejecting the whole batch, so live chains can still be displayed.
 * The returned array is aligned with `supportedChains`.
 *
 * If *all* chains fail, there is nothing left to display, so a
 * `SubgraphUnavailableError` is thrown for callers to handle.
 */
export const settleChainQueries = async <T>(
  query: (chain: SupportedChain) => Promise<T>,
  fallback: (chain: SupportedChain) => T,
): Promise<T[]> => {
  const results = await Promise.allSettled(
    supportedChains.map((chain) => query(chain)),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected")
      console.error(
        `Subgraph query failed on ${supportedChains[i]!.name}:`,
        result.reason,
      );
  });

  if (results.every((result) => result.status === "rejected"))
    throw new SubgraphUnavailableError(
      results.map((result) => (result as PromiseRejectedResult).reason),
    );

  return supportedChains.map((chain, i) => {
    const result = results[i]!;
    return result.status === "fulfilled" ? result.value : fallback(chain);
  });
};

const META_QUERY = `query { _meta { block { number } } }`;

/**
 * Cheap liveness probe across every supported chain's subgraph. Used by
 * chain-scoped pages to decide between a per-chain "data unavailable" state
 * (some other chain is still alive) and a full `SubgraphUnavailableError`.
 */
export const isAnySubgraphAlive = async (): Promise<boolean> => {
  const results = await Promise.allSettled(
    supportedChains.map(async (chain) => {
      const res = await fetch(subgraph_url[chain.id], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: META_QUERY }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        data?: { _meta?: { block?: { number?: number } } };
      };
      if (!json.data?._meta) throw new Error("No _meta in response");
    }),
  );

  return results.some((result) => result.status === "fulfilled");
};
