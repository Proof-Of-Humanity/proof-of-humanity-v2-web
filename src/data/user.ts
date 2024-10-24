import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { MeQuery } from "generated/graphql";

// This fixes an error in the legacy subgraph were registration has not
// been removed as expected. Once solved the issue at subgraph level this
// function should be removed
const sanitize = (res: MeQuery[]) => {
  res.map((claimer) => {
    if (claimer.claimer?.currentRequest && claimer.claimer?.registration)
      claimer.claimer.registration = null;
  });
};

export const getMyData = async (account: string) => {
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Me({ id: account })),
  );

  sanitize(res);

  const homeChain = supportedChains.find(
    (_, i) => res[i].claimer?.registration,
  );
  const requestChain = supportedChains.find(
    (_, i) => res[i].claimer?.currentRequest,
  );

  return {
    homeChain,
    pohId:
      homeChain &&
      res[supportedChains.indexOf(homeChain as any)].claimer!.registration!.id,
    currentRequest: requestChain && {
      chain: requestChain,
      ...res[supportedChains.indexOf(requestChain as any)].claimer!
        .currentRequest!,
    },
  };
};
