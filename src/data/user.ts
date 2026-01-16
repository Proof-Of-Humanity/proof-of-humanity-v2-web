import { supportedChains, legacyChain } from "config/chains";
import { sdk } from "config/subgraph";
import { MeQuery } from "generated/graphql";

// This fixes an error in the legacy subgraph were registration has not
// been removed as expected. Once solved the issue at subgraph level this
// function should be removed
const sanitize = (res: MeQuery[]) => {
  res.map((claimer) => {
    if (claimer.claimer?.currentRequest && claimer.claimer?.registration) {
      if (claimer.claimer?.currentRequest.index <= -100) {
        claimer.claimer.currentRequest = null;
      } else if (res.filter((cl) => cl.claimer?.registration).length > 1) {
        claimer.claimer.registration = null;
      } else {
        claimer.claimer.currentRequest = null;
      }
    }
  });
};

export const getMyData = async (account: string) => {
  const res = await Promise.all(
    supportedChains.map((chain) => sdk[chain.id].Me({ id: account })),
  );
  sanitize(res);
  const homeChain = supportedChains.find((_, i) => {
    const registration = res[i]?.claimer?.registration;
    return !!registration && registration.expirationTime > Date.now() / 1000;
  })
  const requestChain = supportedChains.find(
    (chain, i) =>
      res[i].claimer?.currentRequest &&
      !(
        chain.id === legacyChain.id &&
        res[i].claimer!.currentRequest!.status.id === "vouching"
      ),
  );

  return {
    homeChain,
    pohId:
      homeChain &&
      res[supportedChains.indexOf(homeChain as any)].claimer!.registration!.id,
    expirationTime:
      homeChain &&
      res[supportedChains.indexOf(homeChain as any)].claimer!.registration!
        .expirationTime,
    currentRequest: requestChain && {
      chain: requestChain,
      ...res[supportedChains.indexOf(requestChain as any)].claimer!
        .currentRequest!,
    },
  };
};
