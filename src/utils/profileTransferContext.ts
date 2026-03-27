import type { SupportedChain, SupportedChainId } from "config/chains";
import type { ProfileHumanityQuery } from "generated/graphql";

type TransferStatus = "transferred" | "transferring";

type TransferRequest = {
  chainId: SupportedChainId;
  creationTime?: number | string | null;
  lastStatusChange?: number | string | null;
  status?: {
    id?: string | null;
  } | null;
  winnerParty?: {
    id?: string | null;
  } | null;
};

type BuildTransferContextParams<TRequest extends TransferRequest> = {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  allRequests: TRequest[];
  supportedChains: readonly SupportedChain[];
  getForeignChain: (chainId: number) => number;
  idToChain: (chainId: number) => SupportedChain | null;
};

export type TransferContext<TRequest extends TransferRequest> = {
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  lastTransfer: NonNullable<ProfileHumanityQuery["outTransfer"]>;
  request: TRequest | null;
  received: boolean;
  pending: boolean;
};

const getRequestTimestamp = (request: TransferRequest) =>
  Number(request.lastStatusChange || request.creationTime || 0);

const getTransferTimestamp = (transfer?: ProfileHumanityQuery["outTransfer"] | null) =>
  Number(transfer?.transferTimestamp || 0);

export const isTransferStatus = (
  request: Pick<TransferRequest, "status"> | null | undefined,
): request is { status: { id: TransferStatus } } =>
  request?.status?.id === "transferred" || request?.status?.id === "transferring";

const isRequesterWinner = (request: TransferRequest) =>
  request?.winnerParty?.id === "requester";

const sortByClosestTimestamp =
  (targetTimestamp: number) => (requestA: TransferRequest, requestB: TransferRequest) => {
    const distanceA = Math.abs(getRequestTimestamp(requestA) - targetTimestamp);
    const distanceB = Math.abs(getRequestTimestamp(requestB) - targetTimestamp);

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    return getRequestTimestamp(requestB) - getRequestTimestamp(requestA);
  };

const sortByLatestTimestamp = (requestA: TransferRequest, requestB: TransferRequest) =>
  getRequestTimestamp(requestB) - getRequestTimestamp(requestA);

const getLatestTransferChain = ({
  humanity,
  supportedChains,
}: Pick<
  BuildTransferContextParams<TransferRequest>,
  "humanity" | "supportedChains"
>) =>
  [...supportedChains]
    .filter((chain) => getTransferTimestamp(humanity[chain.id]?.outTransfer) > 0)
    .sort(
      (chainA, chainB) =>
        getTransferTimestamp(humanity[chainB.id]?.outTransfer) -
        getTransferTimestamp(humanity[chainA.id]?.outTransfer),
    )[0] ?? null;

const resolveTransferRequest = <TRequest extends TransferRequest>({
  sourceRequests,
  transferTimestamp,
}: {
  sourceRequests: TRequest[];
  transferTimestamp: number;
}) =>
  sourceRequests
    .filter((request) => isTransferStatus(request) && isRequesterWinner(request))
    .sort(sortByClosestTimestamp(transferTimestamp))[0] ?? null;

export function buildTransferContext<TRequest extends TransferRequest>({
  humanity,
  allRequests,
  supportedChains,
  getForeignChain,
  idToChain,
}: BuildTransferContextParams<TRequest>): TransferContext<TRequest> | null {
  const sourceChain = getLatestTransferChain({ humanity, supportedChains });

  if (!sourceChain) {
    return null;
  }

  const lastTransfer = humanity[sourceChain.id]?.outTransfer;
  const transferTimestamp = getTransferTimestamp(lastTransfer);

  if (!lastTransfer || transferTimestamp <= 0) {
    return null;
  }

  const destinationChainId = getForeignChain(sourceChain.id);
  const destinationChain = idToChain(destinationChainId);

  if (!destinationChain) {
    return null;
  }

  const received =
    !!lastTransfer.transferHash &&
    humanity[destinationChain.id].inTransfers.some(
      (inTransfer) =>
        inTransfer.id.toLowerCase() === lastTransfer.transferHash.toLowerCase(),
    );
  const sourceRequests = allRequests.filter((request) => request.chainId === sourceChain.id);
  const request = resolveTransferRequest({
    sourceRequests,
    transferTimestamp,
  });
  const latestNonTransferRequest = allRequests
    .filter((requestItem) => !isTransferStatus(requestItem))
    .sort(sortByLatestTimestamp)[0];
  const superseded =
    !!latestNonTransferRequest &&
    getRequestTimestamp(latestNonTransferRequest) > transferTimestamp;

  return {
    sourceChain,
    destinationChain,
    lastTransfer,
    request,
    received,
    pending: !received && !superseded && !!request,
  };
}
