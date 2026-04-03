import type { SupportedChainId } from "config/chains";
import type { ProfileHumanityQuery } from "generated/graphql";
import { RequestStatus } from "utils/status";

export type ProfilePageState =
  | "CLAIMED"
  | "TRANSFER_PENDING"
  | "REMOVED"
  | "NOT_CLAIMED";

export type ProfileStateRequest = ArrayElement<
  NonNullable<ProfileHumanityQuery["humanity"]>["requests"]
> & {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
};

export type ProfileStateResult<TRequest extends ProfileStateRequest> = {
  pageState: ProfilePageState;
  latestWinningRequest?: TRequest;
  latestNonTransferRequest?: TRequest;
  timelineRequests: TRequest[];
  pendingRevocation: boolean;
};

type DeriveProfileStateParams<TRequest extends ProfileStateRequest> = {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  allRequests: TRequest[];
  nowSeconds: number;
  getForeignChain: (chainId: number) => number;
};

const getRequestTimestamp = (
  request?: Pick<ProfileStateRequest, "lastStatusChange" | "creationTime">,
) => Number(request?.lastStatusChange || request?.creationTime || 0);

const isTransferStatus = (
  request: Pick<ProfileStateRequest, "status"> | null | undefined,
) => request?.status?.id === "transferred" || request?.status?.id === "transferring";

const isRequesterWinner = (
  request?: Pick<ProfileStateRequest, "winnerParty"> | null,
) => request?.winnerParty?.id === "requester";

const isRequestExpired = (
  request: Pick<ProfileStateRequest, "expirationTime"> | null | undefined,
  nowSeconds: number,
) => Number(request?.expirationTime || 0) > 0 && Number(request?.expirationTime || 0) < nowSeconds;

const sortByLatestTimestamp = (
  requestA: ProfileStateRequest,
  requestB: ProfileStateRequest,
) => getRequestTimestamp(requestB) - getRequestTimestamp(requestA);

const hasPendingTransferForWinningRequest = <TRequest extends ProfileStateRequest>({
  winningRequest,
  humanity,
  nowSeconds,
  getForeignChain,
}: {
  winningRequest: TRequest;
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  nowSeconds: number;
  getForeignChain: (chainId: number) => number;
}): boolean => {
  if (
    ![RequestStatus.TRANSFERRING, RequestStatus.TRANSFERRED].includes(winningRequest.requestStatus)
  ) {
    return false;
  }

  const lastTransfer = humanity[winningRequest.chainId]?.outTransfer;

  if (
    !lastTransfer ||
    Number(lastTransfer.transferTimestamp || 0) <= 0 ||
    Number(lastTransfer.transferTimestamp || 0) !==
    getRequestTimestamp(winningRequest)
  ) {
    return false;
  }

  if (isRequestExpired(winningRequest, nowSeconds)) {
    return false;
  }

  const destinationChainId = getForeignChain(winningRequest.chainId);
  const received = humanity[destinationChainId as SupportedChainId].inTransfers.some(
    (inTransfer) =>
      inTransfer.id.toLowerCase() === lastTransfer.transferHash.toLowerCase(),
  );

  return !received;
};

export function deriveProfileState<TRequest extends ProfileStateRequest>({
  humanity,
  allRequests,
  nowSeconds,
  getForeignChain,
}: DeriveProfileStateParams<TRequest>) {
  const sortedNonTransferRequests = allRequests
    .filter((request) => !isTransferStatus(request))
    .sort(sortByLatestTimestamp);
  const latestNonTransferRequest = sortedNonTransferRequests[0];

  const removedByRevocation =
    !!latestNonTransferRequest &&
    latestNonTransferRequest.status.id === "resolved" &&
    latestNonTransferRequest.revocation &&
    isRequesterWinner(latestNonTransferRequest);

  if (removedByRevocation) {
    return {
      pageState: "REMOVED",
      latestNonTransferRequest,
      timelineRequests: sortedNonTransferRequests,
      pendingRevocation: false,
    } satisfies ProfileStateResult<TRequest>;
  }

  const latestWinningRequest = allRequests
    .filter(
      (request) =>
        [
          RequestStatus.RESOLVED_CLAIM,
          RequestStatus.TRANSFERRING,
          RequestStatus.TRANSFERRED,
        ].includes(request.requestStatus) &&
        isRequesterWinner(request) &&
        !request.revocation &&
        !isRequestExpired(request, nowSeconds),
    )
    .sort(sortByLatestTimestamp)[0];

  if (!latestWinningRequest) {
    return {
      pageState: "NOT_CLAIMED",
      latestNonTransferRequest,
      timelineRequests: sortedNonTransferRequests,
      pendingRevocation: false,
    } satisfies ProfileStateResult<TRequest>;
  }

  const hasPendingTransfer = hasPendingTransferForWinningRequest({
    winningRequest: latestWinningRequest,
    humanity,
    nowSeconds,
    getForeignChain,
  });
  const pageState: ProfilePageState = hasPendingTransfer
    ? "TRANSFER_PENDING"
    : "CLAIMED";
  const timelineRequests = sortedNonTransferRequests.filter(
    (request) =>
      request.chainId !== latestWinningRequest.chainId ||
      request.index !== latestWinningRequest.index,
  );
  const pendingRevocation = timelineRequests.some((request) =>
    [
      RequestStatus.PENDING_REVOCATION,
      RequestStatus.DISPUTED_REVOCATION,
    ].includes(request.requestStatus),
  );

  return {
    pageState,
    latestWinningRequest,
    latestNonTransferRequest,
    timelineRequests,
    pendingRevocation,
  } satisfies ProfileStateResult<TRequest>;
}
