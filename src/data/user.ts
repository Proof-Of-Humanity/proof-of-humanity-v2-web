import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";

export const getMyData = async (account: string) => {
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Me({ id: account })),
  );

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
