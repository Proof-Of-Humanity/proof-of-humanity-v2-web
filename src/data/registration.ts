import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { RegistrationQuery } from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";
import { settleChainQueries } from "./chainQuery";

export const getRegistrationData = cache(async (id: Hash) => {
  const res = await settleChainQueries(
    (chain) => sdk[chain.id].Registration({ id }),
    (): RegistrationQuery => ({ registration: null }),
  );

  return supportedChains.reduce(
    (acc, chain, i) => ({
      ...acc,
      [chain.id]:
        res[i]?.registration &&
        Date.now() / 1000 < res[i].registration!.expirationTime
          ? res[i].registration
          : null,
    }),
    {} as Record<SupportedChainId, RegistrationQuery["registration"]>,
  );
});
