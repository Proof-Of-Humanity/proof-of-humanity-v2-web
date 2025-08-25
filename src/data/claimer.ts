import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { ClaimerQuery } from "generated/graphql";
import { cache } from "react";
import { Address } from "viem";
import { sanitizeClaimerData } from "./sanitizer";

// This fixes an error in the legacy subgraph were registration has not
// been removed as expected. Once solved the issue at subgraph level this
// function should be removed
const sanitizeRegistration = (res: Record<SupportedChainId, ClaimerQuery>) => {
  var regChain: SupportedChainId | undefined = undefined;
  supportedChains.map((chain) => {
    if (!regChain && res[chain.id].claimer?.registration) regChain = chain.id;
    else if (regChain && res[chain.id].claimer?.registration) {
      if (
        res[regChain].claimer?.registration?.humanity.winnerClaim.at(0)
          ?.resolutionTime >
        res[chain.id].claimer?.registration?.humanity.winnerClaim.at(0)
          ?.resolutionTime
      ) {
        res[chain.id].claimer!.registration = null;
      } else {
        res[regChain].claimer!.registration = null;
      }
    }
  });
};

export const getClaimerData = cache(async (id: Address) => {
  const normalizedId = String(id).toLowerCase();
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Claimer({ id: normalizedId })),
  );

  const out = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
    {} as Record<SupportedChainId, ClaimerQuery>,
  );

  sanitizeRegistration(out);
  return await sanitizeClaimerData(out, id);
});

export async function getClaimerName(id: Address): Promise<string | null> {
    const normalizedId = String(id).toLowerCase();
    const res = await Promise.all(
      supportedChains.map((chain) => sdk[chain.id].Claimer({ id: normalizedId })),
    );
    for (const r of res) {
      const name = r?.claimer?.name;
      if (name && name.trim()) return name.trim();
    }
    return null;
}
