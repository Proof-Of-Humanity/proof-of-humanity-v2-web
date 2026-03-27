import { SupportedChainId } from "config/chains";
import { sdk } from "config/subgraph";
import { ProfileRequestQuery } from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";
import { genRequestId } from "./request";

export const getProfileRequestData = cache(
  async (chainId: SupportedChainId, pohId: Hash, index: number) =>
    (await sdk[chainId].ProfileRequest({ id: genRequestId(pohId, index) }))
      .request as ProfileRequestQuery["request"],
);
