import { supportedChains, legacyChain } from "config/chains";
import { sdk } from "config/subgraph";
import { MeQuery } from "generated/graphql";
import { settleChainQueries } from "./chainQuery";

const isTransferStatus = (statusId?: string | null) =>
  statusId === "transferred" || statusId === "transferring";

// This fixes an error in the legacy subgraph were registration has not
// been removed as expected. Once solved the issue at subgraph level this
// function should be removed
const sanitize = (res: MeQuery[]) => {
  res.map((claimer) => {
    if (
      claimer.claimer?.currentRequest &&
      isTransferStatus(claimer.claimer.currentRequest.status.id)
    ) {
      claimer.claimer.currentRequest = null;
      return;
    }

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
  const res = await settleChainQueries(
    (chain) => sdk[chain.id].Me({ id: account }),
    (): MeQuery => ({ claimer: null }),
  );
  sanitize(res);
  const homeChain = supportedChains.find((_, i) => {
    const registration = res[i]?.claimer?.registration;
    return !!registration && registration.expirationTime > Date.now() / 1000;
  });
  const requestChain = supportedChains.find(
    (chain, i) =>
      res[i]?.claimer?.currentRequest &&
      !isTransferStatus(res[i].claimer!.currentRequest!.status.id) &&
      !(
        chain.id === legacyChain.id &&
        res[i].claimer!.currentRequest!.status.id === "vouching" &&
        Number(res[i].claimer!.currentRequest!.index) <= -1
      ),
  );

  const homeChainIndex = homeChain
    ? supportedChains.findIndex((chain) => chain.id === homeChain.id)
    : -1;
  const requestChainIndex = requestChain
    ? supportedChains.findIndex((chain) => chain.id === requestChain.id)
    : -1;
  const homeChainData = homeChainIndex >= 0 ? res[homeChainIndex] : undefined;
  const requestChainData =
    requestChainIndex >= 0 ? res[requestChainIndex] : undefined;

  return {
    homeChain,
    pohId: homeChainData?.claimer?.registration?.id,
    expirationTime: homeChainData?.claimer?.registration?.expirationTime,
    currentRequest: requestChainData?.claimer?.currentRequest && {
      chain: requestChain,
      ...requestChainData.claimer.currentRequest,
    },
  };
};
