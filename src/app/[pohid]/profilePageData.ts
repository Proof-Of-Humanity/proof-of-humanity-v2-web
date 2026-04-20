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

type EnrichedDisplayRequest = DisplayRequest & {
  identityClaimer: DisplayRequest["claimer"];
  identityRequester: DisplayRequest["requester"];
  identityEvidenceGroup: DisplayRequest["evidenceGroup"];
  identityRegistrationEvidenceRevokedReq: string;
};

const sortByLatestTimestamp = (
  requestA: Pick<PoHRequest, "lastStatusChange" | "creationTime">,
  requestB: Pick<PoHRequest, "lastStatusChange" | "creationTime">,
) =>
  Number(requestB.lastStatusChange || requestB.creationTime || 0) -
  Number(requestA.lastStatusChange || requestA.creationTime || 0);

const resolveSourceRequest = async ({
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

const enrichRequest = async ({
  pohId,
  request,
  humanityEvents,
  allRequests,
}: {
  pohId: `0x${string}`;
  request: DisplayRequest;
  humanityEvents: Awaited<ReturnType<typeof getHumanityEvents>>;
  allRequests: PoHRequest[];
}): Promise<EnrichedDisplayRequest> => {
  let identitySourceSeed = request;

  if (request.revocation) { //revocation request doesn't have the identity information, so we need to find the latest winning identity request
    const requestTimestamp = Number(
      request.lastStatusChange || request.creationTime || 0,
    );
    const latestWinningIdentityRequest = allRequests
      .filter(
        (candidate) =>
          candidate.winnerParty?.id === "requester" &&
          !candidate.revocation &&
          Number(candidate.lastStatusChange || candidate.creationTime || 0) <=
          requestTimestamp,
      )
      .sort(sortByLatestTimestamp)[0];

    if (latestWinningIdentityRequest) {
      identitySourceSeed = latestWinningIdentityRequest;
    }
  }

  const identitySourceRequest = await resolveSourceRequest({
    pohId,
    request: identitySourceSeed,
    humanityEvents,
  });

  return {
    ...request,
    identityClaimer: identitySourceRequest.claimer,
    identityRequester: identitySourceRequest.requester,
    identityRegistrationEvidenceRevokedReq:
      identitySourceRequest.registrationEvidenceRevokedReq,
    identityEvidenceGroup: identitySourceRequest.evidenceGroup,
  };
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
  mainCardRequest?: EnrichedDisplayRequest;
  canShowRenewSection: boolean;
  canRenew: boolean;
  crossChainState: CrossChainState;
  crossChainGatewayId?: `0x${string}`;
  lastTransferTimestamp?: number;
  transferCooldownEndsAt?: number;
  arbitrationCost: bigint;
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

  let selectedMainCardRequest: DisplayRequest | undefined =
    showsWinningRequestCard ? profileState.latestWinningRequest : undefined;
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
  let mainCardRequest: EnrichedDisplayRequest | undefined;
  let enrichedHeaderRequest: EnrichedDisplayRequest | undefined;

  if (selectedMainCardRequest) {
    const enrichedRequest = await enrichRequest({
      pohId,
      request: selectedMainCardRequest,
      humanityEvents,
      allRequests,
    });
    mainCardRequest = enrichedRequest;
    enrichedHeaderRequest = enrichedRequest;
  } else if (headerRequest) {
    enrichedHeaderRequest = await enrichRequest({
      pohId,
      request: headerRequest,
      humanityEvents,
      allRequests,
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
  const profileHeader = enrichedHeaderRequest
    ? {
      claimer: enrichedHeaderRequest.identityClaimer,
      evidence: enrichedHeaderRequest.identityEvidenceGroup.evidence,
      requester: enrichedHeaderRequest.identityRequester,
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
    profileHeader,
    crossChainProps,
  } satisfies ProfilePageData;
});
