"use client";

import { useEffect, useState } from "react";
import { supportedChains } from "config/chains";
import { subgraph_url } from "config/subgraph";

type SubgraphHealth = {
  name: string;
  url: string;
  ok: boolean;
  hasIndexingErrors: boolean;
  unreachable: boolean;
};

const META_QUERY = `query { _meta { hasIndexingErrors block { number } } }`;
const REFRESH_INTERVAL_MS = 60_000;

async function probeSubgraph(
  name: string,
  url: string,
): Promise<SubgraphHealth> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: META_QUERY }),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        name,
        url,
        ok: false,
        hasIndexingErrors: false,
        unreachable: true,
      };
    }
    const json = (await res.json()) as {
      data?: { _meta?: { hasIndexingErrors?: boolean } };
      errors?: unknown;
    };
    const hasIndexingErrors = Boolean(json.data?._meta?.hasIndexingErrors);
    const unreachable = !json.data?._meta;
    return {
      name,
      url,
      ok: !hasIndexingErrors && !unreachable,
      hasIndexingErrors,
      unreachable,
    };
  } catch {
    return {
      name,
      url,
      ok: false,
      hasIndexingErrors: false,
      unreachable: true,
    };
  }
}

export default function SubgraphsStatus() {
  const [unhealthy, setUnhealthy] = useState<SubgraphHealth[]>([]);

  useEffect(() => {
    let cancelled = false;

    const targets = supportedChains.map((chain) => ({
      name: `Subgraph on ${chain.name}`,
      url: subgraph_url[chain.id],
    }));

    const run = async () => {
      const results = await Promise.all(
        targets.map((t) => probeSubgraph(t.name, t.url)),
      );
      if (cancelled) return;
      setUnhealthy(results.filter((r) => !r.ok));
    };

    run();
    const id = setInterval(run, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (unhealthy.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#ff9966] to-[#ff8ca9] px-4 py-2 text-center text-white shadow"
    >
      <h2 className="m-0 text-sm font-semibold leading-6 sm:text-base">
        {unhealthy.length === 1
          ? `${unhealthy[0]?.name ?? "Subgraph"} is degraded`
          : `${unhealthy.length} subgraphs are degraded`}
      </h2>
      <p className="m-0 text-xs opacity-90 sm:text-sm">
        {unhealthy
          .map((s) =>
            s.unreachable
              ? `${s.name}: unreachable`
              : `${s.name}: indexing errors`,
          )
          .join(" · ")}
      </p>
    </div>
  );
}
