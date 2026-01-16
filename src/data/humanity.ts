import {
  SupportedChainId,
  supportedChains,
  legacyChain,
} from "config/chains";
import { sdk } from "config/subgraph";
import { HumanityQuery } from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";
import { sanitizeHumanityRequests } from "./sanitizer";

export const getHumanityData = cache(async (pohId: Hash) => {
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Humanity({ id: pohId })),
  );
  if (
    res[supportedChains.findIndex((c) => c.id === legacyChain.id)]?.humanity
      ?.requests
  ) {
    res[
      supportedChains.findIndex((c) => c.id === legacyChain.id)
    ].humanity!.requests = res[
      supportedChains.findIndex((c) => c.id === legacyChain.id)
    ].humanity!.requests.filter((r) => r.status.id !== "vouching");
  }

  const out = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
    {} as Record<SupportedChainId, HumanityQuery>,
  );
  sanitizeHumanityRequests(out);
  return out;
});
