import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { ClaimerQuery } from "generated/graphql";
import { cache } from "react";
import { Address } from "viem";
import { sanitizeClaimerData } from "./sanitizer";

export const getClaimerData = cache(async (id: Address) => {
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Claimer({ id })),
  );

  const out = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
    {} as Record<SupportedChainId, ClaimerQuery>,
  );

  return await sanitizeClaimerData(out, id);
});
