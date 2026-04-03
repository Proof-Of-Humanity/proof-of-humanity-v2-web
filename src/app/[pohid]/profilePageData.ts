import { cache } from "react";

import {
  SupportedChainId,
  getForeignChain,
  idToChain,
  supportedChains,
} from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { getHumanityEvents } from "data/humanityEvents";
import { getProfileData } from "data/profile";
import { getRequestData } from "data/request";
import type { ProfileHumanityQuery } from "generated/graphql";
import { getStatus, RequestStatus } from "utils/status";

import { resolvePendingUpdateRelay } from "./cross-chain/CrossChain";
import {
  deriveCrossChainState,
  type CrossChainState,
} from "./cross-chain/crossChainState";
import type { ProfileTimelineHeaderProps } from "./ProfileTimelineHeader";
import { deriveProfileState, type ProfilePageState } from "./profileState";

type PoHRequest = ArrayElement<
  NonNullable<ProfileHumanityQuery["humanity"]>["requests"]
> & {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
};

type DisplayRequest =
  | PoHRequest
  | (NonNullable<Awaited<ReturnType<typeof getRequestData>>> & {
      chainId: SupportedChainId;
    });

const toWinnerClaim = (request?: DisplayRequest | PoHRequest) =>
  request
    ? [
        {
          index: request.index,
          resolutionTime:
            "lastStatusChange" in request
              ? request.lastStatusChange || request.creationTime || 0
              : 0,
          evidenceGroup: {
            evidence: request.evidenceGroup.evidence,
          },
        },
      ]
    : [];

const enrichRequest = async ({
  pohId,
  request,
  humanityEvents,
}: {
  pohId: `0x${string}`;
  request: DisplayRequest;
  humanityEvents: Awaited<ReturnType<typeof getHumanityEvents>>;
}): Promise<DisplayRequest> => {
  let currentChainId = request.chainId;
  let currentRequest = await getRequestData(
    currentChainId,
    pohId,
    Number(request.index),
  );

  if (!currentRequest) {
    return request;
  }

  while (
    Number(currentRequest.index) <= -100 &&
    currentRequest.inTransferHash
  ) {
    const parentTransfer = humanityEvents.find(
      (event) =>
        event.type === "TRANSFER_INITIATED" &&
        event.transferHash?.toLowerCase() ===
          currentRequest!.inTransferHash!.toLowerCase(),
    );

    if (
      !parentTransfer ||
      parentTransfer.requestIndex === null ||
      parentTransfer.requestIndex === undefined
    ) {
      break;
    }

    const parentRequest = await getRequestData(
      parentTransfer.chainId,
      pohId,
      parentTransfer.requestIndex,
    );

    if (!parentRequest) {
      break;
    }

    currentRequest = parentRequest;
    currentChainId = parentTransfer.chainId;
  }

  return { ...currentRequest, chainId: currentChainId };
};

export type ProfilePageData = {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  contractData: Awaited<ReturnType<typeof getContractDataAllChains>>;
  profileState: ReturnType<typeof deriveProfileState>;
  pageState: ProfilePageState;
  latestWinningRequest?: PoHRequest;
  winningRequestChainId?: SupportedChainId;
  homeChain: ReturnType<typeof idToChain>;
  claimedRegistration:
    | NonNullable<ProfileHumanityQuery["humanity"]>["registration"]
    | undefined;
  claimedHomeChain: NonNullable<ReturnType<typeof idToChain>> | null;
  mainCardRequest?: DisplayRequest;
  canShowRenewSection: boolean;
  canRenew: boolean;
  crossChainState: CrossChainState;
  crossChainGatewayId?: `0x${string}`;
  lastTransferTimestamp?: number;
  transferCooldownEndsAt?: number;
  arbitrationCost: bigint;
  pendingUpdateRelayStatus: Awaited<
    ReturnType<typeof resolvePendingUpdateRelay>
  >;
  pendingUpdateError?: Error;
  profileHeader?: ProfileTimelineHeaderProps;
  crossChainProps: {
    homeChain: NonNullable<ReturnType<typeof idToChain>>;
    transferCooldownEndsAt?: number;
  } | null;
};

export const getProfilePageData = cache(async (pohId: `0x${string}`) => {
  const [humanity, contractData, humanityEvents] = await Promise.all([
    getProfileData(pohId),
    getContractDataAllChains(),
    getHumanityEvents(pohId),
  ]);
  const nowSeconds = Date.now() / 1000;

  const allRequests = supportedChains.flatMap((chain) =>
    (humanity[chain.id]?.humanity?.requests ?? []).map((request) => ({
      ...request,
      chainId: chain.id,
      requestStatus: getStatus(request, {
        humanityLifespan: contractData[chain.id]?.humanityLifespan,
      }),
    })),
  ) as PoHRequest[];

  const profileState = deriveProfileState({
    humanity,
    allRequests,
    nowSeconds,
    getForeignChain,
  });
  const pageState: ProfilePageState = profileState.pageState;
  const latestWinningRequest = profileState.latestWinningRequest;
  const winningRequestChainId = latestWinningRequest?.chainId;
  const latestWinningRequestTimestamp = Number(
    latestWinningRequest?.lastStatusChange ||
      latestWinningRequest?.creationTime ||
      0,
  );
  const showsWinningRequestCard =
    pageState === "CLAIMED" || pageState === "TRANSFER_PENDING";
  const homeChainId =
    pageState === "TRANSFER_PENDING" && winningRequestChainId
      ? (getForeignChain(winningRequestChainId) as SupportedChainId)
      : winningRequestChainId;
  const homeChain = homeChainId ? idToChain(homeChainId) : null;
  const claimedRegistration =
    pageState === "CLAIMED" && homeChain
      ? humanity[homeChain.id]?.humanity?.registration
      : undefined;
  const claimedHomeChain = claimedRegistration && homeChain ? homeChain : null;

  const arbitrationCost =
    claimedHomeChain && claimedRegistration
      ? await getArbitrationCost(
          claimedHomeChain,
          contractData[claimedHomeChain.id].arbitrationInfo.arbitrator,
          contractData[claimedHomeChain.id].arbitrationInfo.extraData,
        )
      : 0n;

  let mainCardRequest: DisplayRequest | undefined = showsWinningRequestCard
    ? profileState.latestWinningRequest
    : undefined;
  const canShowRenewSection =
    !!claimedRegistration && !profileState.pendingRevocation;
  const canRenew =
    canShowRenewSection &&
    !!homeChain &&
    Number(claimedRegistration?.expirationTime || 0) - nowSeconds <
      Number(contractData[homeChain.id]?.renewalPeriodDuration || 0);
  const crossChainState = deriveCrossChainState({
    pageState,
    pendingRevocation: profileState.pendingRevocation,
    hasHomeChain: !!homeChain,
  });
  const transferSourceChainId =
    pageState === "TRANSFER_PENDING" ? winningRequestChainId : homeChain?.id;
  const lastTransferTimestamp = transferSourceChainId
    ? Number(
        humanity[transferSourceChainId]?.outTransfer?.transferTimestamp || 0,
      ) || undefined
    : undefined;

  let headerRequest: DisplayRequest | undefined = showsWinningRequestCard
    ? latestWinningRequest
    : profileState.latestNonTransferRequest;

  if (mainCardRequest) {
    const enrichedRequest = await enrichRequest({
      pohId,
      request: mainCardRequest,
      humanityEvents,
    });
    mainCardRequest = enrichedRequest;
    headerRequest = enrichedRequest;
  } else if (headerRequest) {
    headerRequest = await enrichRequest({
      pohId,
      request: headerRequest,
      humanityEvents,
    });
  }

  const crossChainGatewayId = homeChain
    ? contractData[homeChain.id].gateways[
        contractData[homeChain.id].gateways.length - 1
      ]?.id
    : undefined;
  const transferCooldownEndsAt =
    homeChain && lastTransferTimestamp
      ? lastTransferTimestamp + contractData[homeChain.id].transferCooldown
      : undefined;
  const crossChainProps =
    homeChain && crossChainState.canShowCrossChain
      ? {
          homeChain,
          transferCooldownEndsAt,
        }
      : null;

  let pendingUpdateRelayStatus: Awaited<
    ReturnType<typeof resolvePendingUpdateRelay>
  > = {
    lastOutUpdateTimestamp: undefined,
    pendingUpdateRelay: null,
  };
  let pendingUpdateError: Error | undefined;

  if (crossChainState.canUpdate) {
    try {
      pendingUpdateRelayStatus = await resolvePendingUpdateRelay({
        homeChain: homeChain as NonNullable<typeof homeChain>,
        pohId,
        latestWinningRequestTimestamp:
          latestWinningRequestTimestamp || undefined,
      });
    } catch (error) {
      pendingUpdateError =
        error instanceof Error
          ? error
          : new Error("Unknown pending update relay failure.");
    }
  }

  const profileHeader = headerRequest
    ? {
        claimer: headerRequest.claimer,
        evidence: headerRequest.evidenceGroup.evidence,
        humanityWinnerClaim: toWinnerClaim(headerRequest),
        registrationEvidenceRevokedReq:
          headerRequest.registrationEvidenceRevokedReq,
        requester: headerRequest.requester,
        revocation: headerRequest.revocation,
      }
    : undefined;

  return {
    humanity,
    contractData,
    profileState,
    pageState,
    latestWinningRequest,
    winningRequestChainId,
    homeChain,
    claimedRegistration,
    claimedHomeChain,
    mainCardRequest,
    canShowRenewSection,
    canRenew,
    crossChainState,
    crossChainGatewayId,
    lastTransferTimestamp,
    transferCooldownEndsAt,
    arbitrationCost,
    pendingUpdateRelayStatus,
    pendingUpdateError,
    profileHeader,
    crossChainProps,
  } satisfies ProfilePageData;
});
