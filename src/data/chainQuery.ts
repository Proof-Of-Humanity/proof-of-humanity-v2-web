import { SupportedChain, supportedChains } from "config/chains";

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
