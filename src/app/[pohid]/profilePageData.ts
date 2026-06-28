import { cache } from "react";

import {
  SupportedChainId,
  getForeignChain,
  idToChain,
  supportedChains,
} from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getProfileData } from "data/profile";
import { getHistoricalWinnerClaim } from "data/request";
import type { ProfileHumanityQuery } from "generated/graphql";
import { getStatus, RequestStatus } from "utils/status";

import { deriveProfileState } from "./profileState";

type PoHRequest = ArrayElement<
  NonNullable<ProfileHumanityQuery["humanity"]>["requests"]
> & {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
};

type EnrichedDisplayRequest = PoHRequest & {
  identityClaimer: PoHRequest["claimer"];
  identityRequester: PoHRequest["requester"];
  identityEvidenceGroup: PoHRequest["evidenceGroup"];
};

/**
 * @notice Returns the request data needed by profile cards.
 * @dev Revocation and bridged requests do not carry the original identity evidence,
 * so they are enriched from the latest historical winning claim for the profile.
 */
export const getProfileRequestCardData = cache(
  async (
    pohId: `0x${string}`,
    request: PoHRequest,
  ): Promise<EnrichedDisplayRequest> => {
    // Revocations and bridged requests point at an action request, but the card
    // needs the identity evidence from the latest winning claim.
    const historicalIdentity =
      request.revocation || Number(request.index) <= -100
        ? await getHistoricalWinnerClaim(pohId, request.lastStatusChange)
        : null;

    const identitySource = historicalIdentity || request;

    return {
      ...request,
      identityClaimer: identitySource.claimer,
      identityRequester: identitySource.requester,
      identityEvidenceGroup: identitySource.evidenceGroup,
    };
  },
);

/**
 * @notice Flattens profile requests from every supported chain.
 * @dev Adds the source chain and derived request status needed by profile state logic.
 */
const getAllProfileRequests = (
  humanity: Awaited<ReturnType<typeof getProfileData>>,
  contractData: Awaited<ReturnType<typeof getContractDataAllChains>>,
) =>
  supportedChains.flatMap((chain) =>
    (humanity[chain.id]?.humanity?.requests ?? []).map((request) => ({
      ...request,
      chainId: chain.id,

      requestStatus: getStatus(request, {
        humanityLifespan: contractData[chain.id]?.humanityLifespan,
      }),
    })),
  ) as PoHRequest[];

/**
 * @notice Resolves the profile home chain from the latest winning request.
 * @dev During pending transfers, the home chain is the destination chain.
 */
const getProfileHomeChain = (
  pageState: ReturnType<typeof deriveProfileState<PoHRequest>>["pageState"],
  latestWinningRequest?: PoHRequest,
) =>
  latestWinningRequest
    ? idToChain(
        pageState === "TRANSFER_PENDING"
          ? getForeignChain(latestWinningRequest.chainId)
          : latestWinningRequest.chainId,
      )
    : null;

/**
 * @notice Fetches and derives the base profile page data shared by profile sections.
 * @dev This function intentionally excludes card evidence enrichment and revoke cost
 * fetching so those sections can load independently.
 */
export const getProfileBaseData = cache(async (pohId: `0x${string}`) => {
  const [humanity, contractData] = await Promise.all([
    getProfileData(pohId),
    getContractDataAllChains(),
  ]);
  const nowSeconds = Date.now() / 1000;

  // Keep profile state derivation pure: it decides the public profile state from
  // chain data, while this file decides which extra data each page section needs.
  const profileState = deriveProfileState({
    humanity,
    allRequests: getAllProfileRequests(humanity, contractData),
    nowSeconds,
    getForeignChain,
  });
  const pageState = profileState.pageState;
  const latestWinningRequest = profileState.latestWinningRequest;
  const pendingRevocation = profileState.pendingRevocation;
  const homeChain = getProfileHomeChain(pageState, latestWinningRequest);

  // A usable registration only exists on the current home chain after the profile
  // is claimed. Pending transfers still have a home chain, but no destination
  // registration yet.
  const claimedRegistration =
    pageState === "CLAIMED" && homeChain
      ? humanity[homeChain.id]?.humanity?.registration
      : undefined;

  const claimedHomeChainContractData = claimedHomeChain
    ? contractData[claimedHomeChain.id]
    : null;
  const arbitrationCost =
    claimedHomeChain && claimedRegistration && claimedHomeChainContractData
      ? await getArbitrationCost(
          claimedHomeChain,
          claimedHomeChainContractData.arbitrationInfo.arbitrator,
          claimedHomeChainContractData.arbitrationInfo.extraData,
        )
      : 0n;

  const selectedMainCardRequest: DisplayRequest | undefined =
    showsWinningRequestCard ? profileState.latestWinningRequest : undefined;
  const canShowRenewSection =
    !!claimedRegistration && !profileState.pendingRevocation;
  const renewalAvailableAt =
    claimedRegistration && claimedHomeChainContractData
      ? Number(claimedRegistration.expirationTime) -
        Number(claimedHomeChainContractData.renewalPeriodDuration)
      : undefined;
  const canRenew =
    claimedRegistration && homeChain && !pendingRevocation
      ? Number(claimedRegistration.expirationTime || 0) - nowSeconds <
        Number(contractData[homeChain.id]?.renewalPeriodDuration || 0)
      : false;

  // Transfer cooldown and optimistic state need the chain where the last outgoing
  // transfer was emitted. During pending transfer that is still the source chain.
  const transferSourceChainId =
    pageState === "TRANSFER_PENDING"
      ? latestWinningRequest?.chainId
      : homeChain?.id;

  const lastTransferTimestamp = transferSourceChainId
    ? Number(
        humanity[transferSourceChainId]?.outTransfer?.transferTimestamp || 0,
      ) || undefined
    : undefined;

  const headerRequest: DisplayRequest | undefined = showsWinningRequestCard
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

  const homeChainContractData = homeChain ? contractData[homeChain.id] : null;
  const crossChainGatewayId = homeChainContractData
    ? homeChainContractData.gateways[homeChainContractData.gateways.length - 1]
        ?.id
    : undefined;
  const transferCooldownEndsAt =
    homeChainContractData && lastTransferTimestamp
      ? lastTransferTimestamp + homeChainContractData.transferCooldown
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
    pageState,
    latestWinningRequest,
    latestNonTransferRequest: profileState.latestNonTransferRequest,
    timelineRequests: profileState.timelineRequests,
    pendingRevocation,
    homeChain,
    claimedRegistration,
    canRenew,
    lastTransferTimestamp,
  };
});
