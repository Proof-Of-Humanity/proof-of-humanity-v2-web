"use client";

import { useEffect, useState } from "react";
import { supportedChains } from "config/chains";
import { subgraph_url } from "config/subgraph";
import WarningIcon from "icons/WarningCircle16.svg";

type SubgraphHealth = {
  chainName: string;
  url: string;
  ok: boolean;
  hasIndexingErrors: boolean;
  unreachable: boolean;
};

const META_QUERY = `query { _meta { hasIndexingErrors block { number } } }`;
const REFRESH_INTERVAL_MS = 60_000;

async function probeSubgraph(
  chainName: string,
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
        chainName,
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
      chainName,
      url,
      ok: !hasIndexingErrors && !unreachable,
      hasIndexingErrors,
      unreachable,
    };
  } catch {
    return {
      chainName,
      url,
      ok: false,
      hasIndexingErrors: false,
      unreachable: true,
    };
  }
}

function formatChainList(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default function SubgraphsStatus() {
  const [unhealthy, setUnhealthy] = useState<SubgraphHealth[]>([]);

  useEffect(() => {
    let cancelled = false;

    const targets = supportedChains.map((chain) => ({
      chainName: chain.name,
      url: subgraph_url[chain.id],
    }));

    const run = async () => {
      const results = await Promise.all(
        targets.map((t) => probeSubgraph(t.chainName, t.url)),
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

  const chainNames = unhealthy.map((s) => s.chainName);
  const chainList = formatChainList(chainNames);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-lightOrange border-orange sticky top-0 z-30 w-full border-b shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 text-center sm:px-6">
        <h2 className="text-orange m-0 flex items-center justify-center gap-2 text-sm font-semibold leading-6">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {chainNames.length === 1
            ? `Data for ${chainList} may be incomplete or out of date`
            : "Some data may be incomplete or out of date"}
        </h2>
        <p className="text-secondaryText m-0 text-xs leading-5 sm:text-sm">
          We&apos;re having trouble syncing data from {chainList}. Profiles and
          requests on{" "}
          {chainNames.length === 1 ? "this network" : "these networks"} may be
          missing or show outdated information. Nothing on chain is affected
          please check back in a few minutes.
        </p>
      </div>
    </div>
  );
}
