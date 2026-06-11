import { SupportedChainId, supportedChains, legacyChain } from "config/chains";
import { sdk } from "config/subgraph";
import { HumanityQuery } from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";
import { settleChainQueries } from "./chainQuery";
import { sanitizeHumanityRequests } from "./sanitizer";

export const getHumanityData = cache(async (pohId: Hash) => {
  const res = await settleChainQueries(
    (chain) => sdk[chain.id].Humanity({ id: pohId }),
    (): HumanityQuery => ({ humanity: null }),
  );
  const legacyChainIndex = supportedChains.findIndex(
    (c) => c.id === legacyChain.id,
  );
  if (legacyChainIndex >= 0 && res[legacyChainIndex]?.humanity?.requests) {
    res[legacyChainIndex].humanity!.requests = res[
      legacyChainIndex
    ].humanity!.requests.filter(
      (r) => !(r.status.id === "vouching" && Number(r.index) <= -1),
    );
  }

  const out = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i]! }),
    {} as Record<SupportedChainId, HumanityQuery>,
  );
  await sanitizeHumanityRequests(out);
  return out;
});
