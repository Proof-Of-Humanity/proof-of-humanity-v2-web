import { legacyChain, SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { ProfileHumanityQuery } from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";

export const getProfileData = cache(async (pohId: Hash) => {
  const responses = await Promise.all(
    supportedChains.map((chain) =>
      sdk[chain.id].ProfileHumanity({
        id: pohId,
        humanityId: pohId,
      }),
    ),
  );

  const data = supportedChains.reduce(
    (acc, chain, index) => ({
      ...acc,
      [chain.id]: responses[index],
    }),
    {} as Record<SupportedChainId, ProfileHumanityQuery>,
  );

  if (data[legacyChain.id]?.humanity?.requests) {
    data[legacyChain.id].humanity!.requests = data[
      legacyChain.id
    ].humanity!.requests.filter(
      (request) => !(request.status.id === "vouching" && Number(request.index) <= -1),
    );
  }

  return data;
});
