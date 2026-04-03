import ExternalLink from "components/ExternalLink";
import Card from "components/Request/Card";
import TimeAgo from "components/TimeAgo";
import {
  SupportedChainId,
  explorerLink,
  getForeignChain,
  idToChain,
  supportedChains,
} from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { getHumanityEvents } from "data/humanityEvents";
import { getProfileData } from "data/profile";
import { getProfileRequestData } from "data/profileRequest";
import { getProfileTimelineData } from "data/requestTimeline";
import { ProfileHumanityQuery } from "generated/graphql";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileOptimisticProvider } from "optimistic/profile";
import { shortenAddress } from "utils/address";
import { machinifyId, prettifyId } from "utils/identifier";
import { getStatus, RequestStatus } from "utils/status";
import CrossChain, { resolvePendingUpdateRelay } from "./CrossChain";
import CrossChainLoading from "./cross-chain/CrossChainLoading";
import { deriveProfileState, type ProfilePageState } from "./profileState";
import { TimelineHistorySectionSkeleton } from "./[chain]/[request]/TimelineSection";
import { ProfileTimelineSection } from "./TimelineSection";
import Renew from "./Renew";
import Revoke from "./Revoke";

type PoHRequest = ArrayElement<
  NonNullable<ProfileHumanityQuery["humanity"]>["requests"]
> & {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
};

type DisplayRequest =
  | PoHRequest
  | (NonNullable<Awaited<ReturnType<typeof getProfileRequestData>>> & {
      chainId: SupportedChainId;
    });

export type CrossChainState = {
  canShowCrossChain: boolean;
  canTransfer: boolean;
  canUpdate: boolean;
};

export const deriveCrossChainState = ({
  pageState,
  pendingRevocation,
  hasHomeChain,
}: {
  pageState: ProfilePageState;
  pendingRevocation: boolean;
  hasHomeChain: boolean;
}): CrossChainState => {
  const canTransfer =
    hasHomeChain && pageState === "CLAIMED" && !pendingRevocation;
  const canUpdate =
    hasHomeChain && (pageState === "CLAIMED" || pageState === "REMOVED");

  return {
    canShowCrossChain:
      hasHomeChain &&
      (pageState === "TRANSFER_PENDING" || canTransfer || canUpdate),
    canTransfer,
    canUpdate,
  };
};

export const isTransferCooldownActive = ({
  transferCooldownEndsAt,
  nowSeconds,
}: {
  transferCooldownEndsAt?: number;
  nowSeconds: number;
}) =>
  transferCooldownEndsAt !== undefined
    ? transferCooldownEndsAt >= nowSeconds
    : false;

export const isOutboundUpdateExpired = (
  outboundUpdateTimestamp: bigint,
  nowSeconds: number,
) => nowSeconds > Number(outboundUpdateTimestamp);

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

/**
 * @notice Resolves a synthetic bridged request back to its real source request.
 * @dev Negative request indexes are transfer-created artifacts. The profile UI
 *      walks transfer lineage so card and header identity/evidence come from
 *      the original source request.
 */
const enrichRequest = async ({
  pohId,
  request,
  humanityEvents,
}: {
  pohId: `0x${string}`;
  request: DisplayRequest;
  humanityEvents: Awaited<ReturnType<typeof getHumanityEvents>>;
}): Promise<DisplayRequest> => {
  if (Number(request.index) > -100) {
    return request;
  }

  let currentChainId = request.chainId;
  let currentRequest = await getProfileRequestData(
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

    const parentRequest = await getProfileRequestData(
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

interface PageProps {
  params: { pohid: string };
}

async function Profile({ params: { pohid } }: PageProps) {
  const pohId = machinifyId(pohid);

  if (!pohId) return <>Not found</>;

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
  /**
   * @notice Request rendered by the main card.
   * @dev Only claimed and transfer-pending profiles render a main identity card.
   */
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
  /**
   * @notice Request rendered by the profile header.
   * @dev Falls back to the latest non-transfer request when no winning request
   *      exists for the current profile state.
   */
  let headerRequest: DisplayRequest | undefined = showsWinningRequestCard
    ? latestWinningRequest
    : profileState.latestNonTransferRequest;

  /**
   * @notice Normalizes header and card requests into one renderable shape.
   * @dev Synthetic bridged requests are enriched before rendering so the rest
   *      of the page does not need transfer-specific branches.
   */
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
  const crossChainProps =
    homeChain && crossChainState.canShowCrossChain
      ? {
          homeChain,
          transferCooldownEndsAt: lastTransferTimestamp
            ? lastTransferTimestamp +
              contractData[homeChain.id].transferCooldown
            : undefined,
        }
      : null;
  let pendingUpdateRelayStatus: Awaited<
    ReturnType<typeof resolvePendingUpdateRelay>
  > = {
    lastOutUpdateTimestamp: undefined,
    pendingUpdateRelay: null,
  };
  let pendingUpdateError: Error | undefined;

  if (crossChainState.canUpdate && homeChain) {
    try {
      pendingUpdateRelayStatus = await resolvePendingUpdateRelay({
        homeChain,
        pohId,
      });
    } catch (error) {
      console.error("[pending-update-relay] resolve failed", {
        pohId,
        pageState,
        homeChainId: homeChain.id,
        winningRequestChainId,
        error,
      });
      pendingUpdateError =
        error instanceof Error
          ? error
          : new Error("Unknown pending update relay failure.");
    }
  }
  const profileTimelineDataPromise = getProfileTimelineData(
    pohId,
    profileState.timelineRequests as Parameters<
      typeof getProfileTimelineData
    >[1],
  );
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

  return (
    <div className="content">
      <div className="paper relative mt-24 flex flex-col items-center pt-20">
        <div className="bordered absolute -top-16 left-1/2 -translate-x-1/2 rounded-full shadow">
          <div className="bg-whiteBackground h-32 w-32 rounded-full px-6 pt-5">
            <Image
              alt="poh id"
              src="/logo/pohid.svg"
              height={128}
              width={128}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">POH ID</span>
          <span className="mb-12 text-center text-xl font-semibold">
            {prettifyId(pohId).slice(0, 20)}
            <wbr />
            {prettifyId(pohId).slice(20)}
          </span>
        </div>

        {claimedRegistration && claimedHomeChain ? (
          <>
            <div className="mb-2 flex text-emerald-500">
              Claimed by
              <ExternalLink
                className="ml-2 underline underline-offset-2"
                href={explorerLink(
                  claimedRegistration.claimer.id,
                  claimedHomeChain,
                )}
              >
                {shortenAddress(claimedRegistration.claimer.id)}
              </ExternalLink>
            </div>
            <span className="text-secondaryText mb-2">
              {claimedRegistration.expirationTime < nowSeconds
                ? "Expired "
                : "Expires "}
              <TimeAgo time={claimedRegistration.expirationTime} />
            </span>
          </>
        ) : null}

        {pageState === "TRANSFER_PENDING" ? (
          <span className="text-secondaryText mb-2">Transfer pending.</span>
        ) : null}

        {showsWinningRequestCard && mainCardRequest ? (
          <>
            <div className="mb-3 mt-4 flex items-center justify-center">
              <Card
                chainId={mainCardRequest.chainId}
                claimer={mainCardRequest.claimer}
                evidence={mainCardRequest.evidenceGroup.evidence}
                humanity={{
                  id: pohId,
                  registration:
                    humanity[mainCardRequest.chainId]?.humanity?.registration,
                  winnerClaim: toWinnerClaim(mainCardRequest),
                }}
                index={mainCardRequest.index}
                requester={mainCardRequest.requester}
                revocation={mainCardRequest.revocation}
                registrationEvidenceRevokedReq={
                  mainCardRequest.registrationEvidenceRevokedReq
                }
                requestStatus={
                  pageState === "TRANSFER_PENDING"
                    ? RequestStatus.RESOLVED_CLAIM
                    : profileState.latestWinningRequest?.requestStatus ||
                      RequestStatus.RESOLVED_CLAIM
                }
              />
            </div>

            {canShowRenewSection && claimedHomeChain ? (
              canRenew ? (
                <Renew claimer={claimedRegistration.claimer.id} pohId={pohId} />
              ) : (
                <span className="text-secondaryText mb-4">
                  Renewal available{" "}
                  <TimeAgo
                    time={
                      +claimedRegistration.expirationTime -
                      +contractData[claimedHomeChain.id].renewalPeriodDuration
                    }
                  />
                </span>
              )
            ) : null}
          </>
        ) : (
          <>
            <span className="text-orange mb-6">
              {pageState === "REMOVED" ? "Removed" : "Not claimed"}
            </span>
            {pageState === "NOT_CLAIMED" || pageState === "REMOVED" ? (
              <Link
                className="btn-main mb-6"
                href={`/${pohId}/claim`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim humanity
              </Link>
            ) : null}
          </>
        )}

        <ProfileOptimisticProvider
          base={{
            winningStatus: latestWinningRequest?.status.id,
            lastTransferTimestamp,
            lastOutUpdateTimestamp:
              pendingUpdateRelayStatus.lastOutUpdateTimestamp,
            pendingRevocation: profileState.pendingRevocation,
            hasPendingUpdateRelay:
              !!pendingUpdateRelayStatus.pendingUpdateRelay,
            hasPendingTransferRelay: pageState === "TRANSFER_PENDING",
          }}
          storageKey={`profile:${pohId}`}
        >
          {claimedRegistration && claimedHomeChain ? (
            <Revoke
              pohId={pohId}
              arbitrationInfo={
                contractData[claimedHomeChain.id].arbitrationInfo!
              }
              homeChain={claimedHomeChain}
              cost={
                arbitrationCost +
                BigInt(contractData[claimedHomeChain.id].baseDeposit)
              }
            />
          ) : null}

          {crossChainProps ? (
            <Suspense fallback={<CrossChainLoading />}>
              <CrossChain
                homeChain={crossChainProps.homeChain}
                pageState={pageState}
                pohId={pohId}
                humanity={humanity}
                gatewayId={crossChainGatewayId}
                winningRequestChainId={winningRequestChainId}
                crossChainState={crossChainState}
                transferCooldownEndsAt={crossChainProps.transferCooldownEndsAt}
                pendingUpdateRelayStatus={pendingUpdateRelayStatus}
                pendingUpdateError={pendingUpdateError}
              />
            </Suspense>
          ) : null}
        </ProfileOptimisticProvider>
      </div>

      <Suspense fallback={<TimelineHistorySectionSkeleton />}>
        <ProfileTimelineSection
          profileHeader={profileHeader}
          timelineDataPromise={profileTimelineDataPromise}
        />
      </Suspense>
    </div>
  );
}

export default Profile;
