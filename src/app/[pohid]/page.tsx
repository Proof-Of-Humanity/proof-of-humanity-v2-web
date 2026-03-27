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
import { buildTransferContext, isTransferStatus } from "utils/profileTransferContext";
import { getStatus, RequestStatus } from "utils/status";
import CrossChain from "./CrossChain";
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

type PageState = "CLAIMED" | "TRANSFER_PENDING" | "REMOVED" | "NOT_CLAIMED";

const sortRequestsByLatest = (requestA: PoHRequest, requestB: PoHRequest) =>
  Number(requestB.lastStatusChange || requestB.creationTime) -
  Number(requestA.lastStatusChange || requestA.creationTime);

const isWinningRequest = (request: PoHRequest) =>
  request.winnerParty?.id === "requester" &&
  !request.revocation &&
  [
    RequestStatus.RESOLVED_CLAIM,
    RequestStatus.TRANSFERRING,
    RequestStatus.TRANSFERRED,
  ].includes(request.requestStatus);

const isSameRequest = (
  requestA?: Pick<PoHRequest, "chainId" | "index">,
  requestB?: Pick<PoHRequest, "chainId" | "index">,
) =>
  !!requestA &&
  !!requestB &&
  requestA.chainId === requestB.chainId &&
  requestA.index === requestB.index;

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

// if request is -100 ,its means it was transferred walk back its lineage to find actual source request
const enrichRequest = async ({
  pohId,
  request,
}: {
  pohId: `0x${string}`;
  request: DisplayRequest;
}): Promise<DisplayRequest> => {
  if (Number(request.index) > -100) {
    return request;
  }

  const events = await getHumanityEvents(pohId);
  let currentChainId = request.chainId;
  let currentRequest = await getProfileRequestData(
    currentChainId,
    pohId,
    Number(request.index),
  );

  if (!currentRequest) {
    return request;
  }

  while (Number(currentRequest.index) <= -100 && currentRequest.inTransferHash) {
    const parentTransfer = events.find(
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

  const [humanity, contractData] = await Promise.all([
    getProfileData(pohId),
    getContractDataAllChains(),
  ]);
  const nowSeconds = Date.now() / 1000;

  const homeChain = supportedChains.find(
    (chain) =>
      !!humanity[chain.id]?.humanity?.registration &&
      !(humanity[chain.id]?.humanity?.registration?.expirationTime < nowSeconds),
  );

  const arbitrationCost = homeChain
    ? await getArbitrationCost(
      homeChain,
      contractData[homeChain.id].arbitrationInfo.arbitrator,
      contractData[homeChain.id].arbitrationInfo.extraData,
    )
    : 0n;

  const allRequests = supportedChains.flatMap((chain) =>
    (humanity[chain.id]?.humanity?.requests ?? []).map((request) => ({
      ...request,
      chainId: chain.id,
      requestStatus: getStatus(request, {
        humanityLifespan: contractData[chain.id]?.humanityLifespan,
      }),
    })),
  ) as PoHRequest[];

  const transferContext = buildTransferContext({
    humanity,
    allRequests,
    supportedChains,
    getForeignChain,
    idToChain,
  });
  // The latest requester-won non-revocation request the profile can render as verified.
  const latestWinningRequest = allRequests
    .filter(isWinningRequest)
    .sort(sortRequestsByLatest)[0];
  // Timeline history excludes the current winning request and transfer artifact requests.
  const timelineRequests = allRequests
    .filter((request) => !isSameRequest(request, latestWinningRequest))
    .filter((request) => !isTransferStatus(request))
    .sort(sortRequestsByLatest);
  // Pending/disputed revocations keep the verified card visible but block some controls.
  const pendingRevocation = allRequests
    .filter((request) => !isTransferStatus(request))
    .filter((request) => !isSameRequest(request, latestWinningRequest))
    .some((request) =>
      [
        RequestStatus.PENDING_REVOCATION,
        RequestStatus.DISPUTED_REVOCATION,
      ].includes(request.requestStatus),
    );
  const latestNonTransferRequest = allRequests
    .filter((request) => !isTransferStatus(request))
    .sort(sortRequestsByLatest)[0];
  const latestResolvedRequest = allRequests
    .filter((request) => request.status.id === "resolved")
    .sort(sortRequestsByLatest)[0];
  // A requester-won resolved revocation is the terminal "removed" state.
  const removedByRevocation =
    !!latestResolvedRequest &&
    latestResolvedRequest.revocation &&
    latestResolvedRequest.winnerParty?.id === "requester";
  // CLAIMED: active registration and a winning request.
  // TRANSFER_PENDING: latest transfer is still in flight, but we keep the winning identity visible.
  // REMOVED: latest resolved request removed the profile.
  // NOT_CLAIMED: no active winning claim and no active transfer.
  const pageState: PageState = removedByRevocation
    ? "REMOVED"
    : homeChain && latestWinningRequest
      ? "CLAIMED"
      : transferContext?.pending && latestWinningRequest
        ? "TRANSFER_PENDING"
        : "NOT_CLAIMED";
  // The main card only exists for claimed and transfer-pending profiles.
  let mainCardRequest: DisplayRequest | undefined =
    pageState === "CLAIMED" || pageState === "TRANSFER_PENDING"
      ? latestWinningRequest
      : undefined;
  const canShowRenewSection = pageState === "CLAIMED" && !pendingRevocation;
  const canRenew =
    canShowRenewSection &&
    !!homeChain &&
    Number(humanity[homeChain.id]?.humanity?.registration?.expirationTime || 0) -
    nowSeconds <
    Number(contractData[homeChain.id]?.renewalPeriodDuration || 0);
  const canShowCrossChain =
    (pageState === "CLAIMED" && !pendingRevocation) ||
    pageState === "TRANSFER_PENDING";
  // The header falls back to the latest non-transfer request when there is no winning claim.
  let headerRequest: DisplayRequest | undefined =
    pageState === "CLAIMED" || pageState === "TRANSFER_PENDING"
      ? latestWinningRequest
      : latestNonTransferRequest;

  // Enrich synthetic bridged requests so the rest of the page can render one request shape.
  [mainCardRequest, headerRequest] = await Promise.all([
    mainCardRequest
      ? enrichRequest({
        pohId,
        request: mainCardRequest,
      })
      : Promise.resolve(undefined),
    headerRequest
      ? enrichRequest({
        pohId,
        request: headerRequest,
      })
      : Promise.resolve(undefined),
  ]);
  const transferSourceChain = transferContext?.sourceChain;
  const latestTransfer = transferSourceChain
    ? humanity[transferSourceChain.id].outTransfer
    : undefined;
  const transferDestinationChain = transferContext?.destinationChain;
  const transferDisplayClaimer =
    (mainCardRequest?.claimer.id ||
      humanity[transferDestinationChain?.id as SupportedChainId]?.crossChainRegistration
        ?.claimer.id ||
      humanity[transferSourceChain?.id as SupportedChainId]?.crossChainRegistration
        ?.claimer.id) as `0x${string}` | undefined;
  const hasReceivedLatestTransfer =
    !!homeChain &&
    !!latestTransfer?.transferHash &&
    humanity[homeChain.id].inTransfers.some(
      (inTransfer) =>
        inTransfer.id.toLowerCase() === latestTransfer.transferHash.toLowerCase(),
    );
  const profileTimelineDataPromise = getProfileTimelineData(
    pohId,
    timelineRequests as Parameters<typeof getProfileTimelineData>[1],
  );
  const profileHeader = headerRequest
    ? {
      claimer: headerRequest.claimer,
      evidence: headerRequest.evidenceGroup.evidence,
      humanityWinnerClaim: toWinnerClaim(headerRequest),
      registrationEvidenceRevokedReq: headerRequest.registrationEvidenceRevokedReq,
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

        {pageState === "CLAIMED" && homeChain ? (
          <>
            <div className="mb-2 flex text-emerald-500">
              Claimed by
              <ExternalLink
                className="ml-2 underline underline-offset-2"
                href={explorerLink(
                  humanity[homeChain.id]!.humanity!.registration!.claimer.id,
                  homeChain,
                )}
              >
                {shortenAddress(
                  humanity[homeChain.id]!.humanity!.registration!.claimer.id,
                )}
              </ExternalLink>
            </div>
            <span className="text-secondaryText mb-2">
              {humanity[homeChain.id]!.humanity!.registration!.expirationTime <
                nowSeconds
                ? "Expired "
                : "Expires "}
              <TimeAgo
                time={humanity[homeChain.id]!.humanity!.registration!.expirationTime}
              />
            </span>
          </>
        ) : null}

        {pageState === "TRANSFER_PENDING" ? (
          <span className="text-secondaryText mb-2">Transfer pending.</span>
        ) : null}

        {(pageState === "CLAIMED" || pageState === "TRANSFER_PENDING") &&
          mainCardRequest ? (
          <>
            <div className="mt-4 mb-3 flex items-center justify-center">
              <Card
                chainId={mainCardRequest.chainId}
                claimer={mainCardRequest.claimer}
                evidence={mainCardRequest.evidenceGroup.evidence}
                humanity={{
                  id: pohId,
                  registration: humanity[mainCardRequest.chainId]?.humanity?.registration,
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
                    : latestWinningRequest?.requestStatus ||
                      RequestStatus.RESOLVED_CLAIM
                }
              />
            </div>

            {canShowRenewSection && homeChain ? (
              canRenew ? (
                <Renew
                  claimer={
                    humanity[homeChain.id]!.humanity!.registration!.claimer.id
                  }
                  pohId={pohId}
                />
              ) : (
                <span className="text-secondaryText mb-4">
                  Renewal available{" "}
                  <TimeAgo
                    time={
                      +humanity[homeChain.id]!.humanity!.registration!
                        .expirationTime -
                      +contractData[homeChain.id].renewalPeriodDuration
                    }
                  />
                </span>
              )
            ) : null}

            <ProfileOptimisticProvider
              base={{
                winningStatus:
                  pageState === "TRANSFER_PENDING"
                    ? transferContext?.request?.status.id === "transferring"
                      ? "transferring"
                      : transferContext?.request
                        ? "transferred"
                        : undefined
                    : latestWinningRequest?.status.id,
                pendingRevocation,
              }}
              storageKey={`profile:${pohId}`}
            >
              {pageState === "CLAIMED" && homeChain ? (
                <Revoke
                  pohId={pohId}
                  arbitrationInfo={contractData[homeChain.id].arbitrationInfo!}
                  homeChain={homeChain}
                  cost={
                    arbitrationCost +
                    BigInt(contractData[homeChain.id].baseDeposit)
                  }
                />
              ) : null}

              {canShowCrossChain ? (
                <CrossChain
                  claimer={
                    pageState === "TRANSFER_PENDING"
                      ? ((transferDisplayClaimer || pohId) as `0x${string}`)
                      : humanity[homeChain!.id]!.humanity!.registration!.claimer.id
                  }
                  contractData={contractData}
                  hasReceivedLatestTransfer={
                    pageState === "TRANSFER_PENDING"
                      ? !!transferContext?.received
                      : hasReceivedLatestTransfer
                  }
                  homeChain={
                    pageState === "TRANSFER_PENDING"
                      ? transferDestinationChain!
                      : homeChain!
                  }
                  pohId={pohId}
                  humanity={humanity}
                  lastTransfer={
                    pageState === "TRANSFER_PENDING"
                      ? transferContext?.lastTransfer
                      : latestTransfer
                  }
                  lastTransferChain={transferSourceChain}
                />
              ) : null}
            </ProfileOptimisticProvider>
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
