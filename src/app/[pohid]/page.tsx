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
import { getHumanityData } from "data/humanity";
import { getHumanityEvents } from "data/humanityEvents";
import { getRequestData } from "data/request";
import { HumanityQuery } from "generated/graphql";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Suspense } from "react";
import { shortenAddress } from "utils/address";
import { machinifyId, prettifyId } from "utils/identifier";
import { getProfileTimelineData } from "data/requestTimeline";
import { TimelineHistorySectionSkeleton } from "./[chain]/[request]/TimelineSection";
import CrossChain from "./CrossChain";
import Renew from "./Renew";
import Revoke from "./Revoke";
import { getStatus, RequestStatus } from "utils/status";
import { ProfileTimelineSection } from "./TimelineSection";
import { ProfileOptimisticProvider } from "optimistic/profile";

type PoHRequest = ArrayElement<
  NonNullable<HumanityQuery["humanity"]>["requests"]
> & {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
};

type WinnerClaimRequest = NonNullable<
  HumanityQuery["humanity"]
>["winnerClaim"][0];

type WinnerClaimData = {
  chainId?: SupportedChainId;
  request?: WinnerClaimRequest;
  requestQuery?: ArrayElement<NonNullable<HumanityQuery["humanity"]>["requests"]>;
  status?: string;
  requestStatus?: RequestStatus;
};

const getDisplayEvidence = (
  requestEvidence: { uri: string }[],
  winnerClaimEvidence?: { uri: string }[],
) =>
  winnerClaimEvidence && winnerClaimEvidence.length > 0
    ? winnerClaimEvidence
    : requestEvidence;

const resolveTransferDisplaySource = async ({
  pohId,
  request,
  humanity,
}: {
  pohId: `0x${string}`;
  request: PoHRequest;
  humanity: Record<SupportedChainId, HumanityQuery>;
}) => {
  const currentChainWinnerClaim =
    humanity[request.chainId]?.humanity?.winnerClaim?.at(0)?.evidenceGroup.evidence;
  const fallback = {
    claimer: request.claimer,
    evidence: getDisplayEvidence(
      request.evidenceGroup.evidence,
      currentChainWinnerClaim,
    ),
  };
  const events = await getHumanityEvents(pohId);
  let currentChainId = request.chainId;
  let currentRequest = await getRequestData(
    currentChainId,
    pohId,
    Number(request.index),
  );

  if (!currentRequest) {
    return fallback;
  }

  while (Number(currentRequest.index) <= -100 && currentRequest.inTransferHash) {
    const currentTransferHash = currentRequest.inTransferHash.toLowerCase();
    const parentTransfer = events.find(
      (event) =>
        event.type === "TRANSFER_INITIATED" &&
        event.transferHash?.toLowerCase() === currentTransferHash,
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

  if (currentRequest.evidenceGroup.evidence.length) {
    return {
      claimer: currentRequest.claimer,
      evidence: currentRequest.evidenceGroup.evidence,
    };
  }

  const currentRequestWinnerClaim =
    humanity[currentChainId]?.humanity?.winnerClaim?.at(0)?.evidenceGroup.evidence;

  return {
    claimer: currentRequest.claimer,
    evidence: getDisplayEvidence(
      currentRequest.evidenceGroup.evidence,
      currentRequestWinnerClaim,
    ),
  };
};

const isTransferArtifactRequest = (request: {
  index: number | string;
  status?: {
    id: string;
  } | null;
}) =>
  request.status?.id === "transferred" || request.status?.id === "transferring";

interface PageProps {
  params: { pohid: string };
}

async function Profile({ params: { pohid } }: PageProps) {
  const pohId = machinifyId(pohid);

  if (!pohId) return <>Not found</>;

  const [humanity, contractData] = await Promise.all([
    getHumanityData(pohId),
    getContractDataAllChains(),
  ]);

  const homeChain = supportedChains.find(
    (chain) =>
      !!humanity[chain.id]?.humanity?.registration &&
      !(
        humanity[chain.id]?.humanity?.registration?.expirationTime <
        Date.now() / 1000
      ),
  );

  const arbitrationCost = homeChain
    ? await getArbitrationCost(
      homeChain,
      contractData[homeChain.id].arbitrationInfo.arbitrator,
      contractData[homeChain.id].arbitrationInfo.extraData,
    )
    : 0n;

  const lastEvidenceChain = [...supportedChains]
    .filter((chain) => !!humanity[chain.id]?.humanity?.winnerClaim[0])
    .sort((chain1, chain2) => {
      const req1 = humanity[chain1.id]?.humanity?.winnerClaim[0];
      const req2 = humanity[chain2.id]?.humanity?.winnerClaim[0];
      return Number(req2?.resolutionTime || 0) - Number(req1?.resolutionTime || 0);
    })[0];

  const retrieveWinnerClaimData = (): WinnerClaimData => {
    let chainId;
    let status;
    let currentRequest;
    let requestQuery;
    let requestStatus;
    if (lastEvidenceChain) {
      const request = humanity[lastEvidenceChain.id].humanity!.winnerClaim[0];
      if (request) {
        requestQuery = humanity[lastEvidenceChain.id]!.humanity!.requests.find(
          (req) => req.index === request!.index,
        );
        if (!requestQuery) return {};
        requestStatus = getStatus(
          {
            status: { id: requestQuery.status.id },
            creationTime: requestQuery.creationTime,
            expirationTime: requestQuery?.expirationTime,
            index: request.index,
            revocation: requestQuery.revocation,
            winnerParty: requestQuery?.winnerParty,
          },
          {
            humanityLifespan:
              contractData[lastEvidenceChain.id].humanityLifespan,
          },
        );
        if (requestStatus !== RequestStatus.EXPIRED) {
          chainId = lastEvidenceChain.id;
          currentRequest = request;
          status = requestQuery.status.id as string;
        }
      }
    }

    return {
      chainId,
      request: currentRequest,
      requestQuery,
      status,
      requestStatus,
    };
  };

  const winnerClaimData = retrieveWinnerClaimData();
  const hasCurrentWinnerClaim =
    !!winnerClaimData.request &&
    !!winnerClaimData.requestQuery &&
    winnerClaimData.requestStatus !== RequestStatus.EXPIRED;

  const allRequests = supportedChains.flatMap((chain) =>
    (humanity[chain.id]?.humanity?.requests ?? []).map((request) => ({
      ...request,
      chainId: chain.id,
      requestStatus: getStatus(request, {
        humanityLifespan: contractData[chain.id]?.humanityLifespan,
      }),
    })),
  );

  const profileRequests = allRequests
    .filter((request) => {
      const isCurrentWinningRequest =
        !!winnerClaimData.request &&
        request.chainId === winnerClaimData.chainId &&
        request.index === winnerClaimData.request.index;

      return !isCurrentWinningRequest;
    })
    .filter((request) => !isTransferArtifactRequest(request))
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    ) as PoHRequest[];

  const activeRequests = allRequests
    .filter((request) => !isTransferArtifactRequest(request))
    .filter((request) => {
      const isCurrentWinningRequest =
        !!winnerClaimData.request &&
        request.chainId === winnerClaimData.chainId &&
        request.index === winnerClaimData.request.index;

      return !isCurrentWinningRequest;
    })
    .filter((request) =>
      [
        RequestStatus.VOUCHING,
        RequestStatus.PENDING_CLAIM,
        RequestStatus.PENDING_REVOCATION,
        RequestStatus.DISPUTED_CLAIM,
        RequestStatus.DISPUTED_REVOCATION,
      ].includes(request.requestStatus),
    )
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    ) as PoHRequest[];

  const hasActiveRequests = activeRequests.length > 0;
  const pendingRevocation = activeRequests.some((request) => request.revocation);
  const latestRequest = allRequests
    .filter((request) => !isTransferArtifactRequest(request))
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    )[0];

  const latestTransferArtifact = allRequests
    .filter((request) => isTransferArtifactRequest(request))
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    )[0];

  const lastTransferChain = [...supportedChains].sort((chain1, chain2) => {
    const out1 = humanity[chain1.id]?.outTransfer;
    const out2 = humanity[chain2.id]?.outTransfer;
    return out2
      ? out1
        ? out2.transferTimestamp - out1.transferTimestamp
        : 1
      : -1;
  })[0];

  const canRenew =
    homeChain &&
    +humanity[homeChain.id]!.humanity!.registration!.expirationTime -
    Date.now() / 1000 <
    +contractData[homeChain.id].renewalPeriodDuration;
  const transferWinningStatus =
    latestTransferArtifact?.status.id === "transferred" ||
    latestTransferArtifact?.status.id === "transferring"
      ? latestTransferArtifact.status.id
      : undefined;
  const isTransferPendingProfile = !homeChain && !!transferWinningStatus;
  const currentTransferRequest =
    isTransferPendingProfile && latestTransferArtifact
      ? (latestTransferArtifact as PoHRequest)
      : undefined;
  const transferDisplaySource = currentTransferRequest
    ? await resolveTransferDisplaySource({
        pohId,
        request: currentTransferRequest,
        humanity,
      })
    : undefined;
  const transferHomeChain = transferWinningStatus
    ? idToChain(getForeignChain(lastTransferChain.id))!
    : undefined;
  const transferClaimer =
    (winnerClaimData.requestQuery?.claimer.id ||
      humanity[transferHomeChain?.id as SupportedChainId]?.crossChainRegistration
        ?.claimer.id) as `0x${string}` | undefined;
  const profileTimelineDataPromise = getProfileTimelineData(
    pohId,
    profileRequests,
  );
  const profileHeader =
    currentTransferRequest
      ? {
          claimer: transferDisplaySource?.claimer || currentTransferRequest.claimer,
          evidence: transferDisplaySource?.evidence || getDisplayEvidence(
            currentTransferRequest.evidenceGroup.evidence,
            humanity[currentTransferRequest.chainId]?.humanity?.winnerClaim?.at(0)
              ?.evidenceGroup.evidence,
          ),
          humanityWinnerClaim:
            humanity[currentTransferRequest.chainId]?.humanity?.winnerClaim ??
            [],
          registrationEvidenceRevokedReq:
            currentTransferRequest.registrationEvidenceRevokedReq,
          requester: currentTransferRequest.requester,
          revocation: currentTransferRequest.revocation,
        }
      : hasCurrentWinnerClaim
      ? {
          claimer: winnerClaimData.requestQuery!.claimer,
          evidence: winnerClaimData.request!.evidenceGroup.evidence,
          humanityWinnerClaim:
            humanity[winnerClaimData.chainId as SupportedChainId]?.humanity
              ?.winnerClaim ?? [],
          registrationEvidenceRevokedReq: "",
          requester: winnerClaimData.requestQuery!.requester,
          revocation: false,
        }
      : latestRequest
        ? {
            claimer: latestRequest.claimer,
            evidence: latestRequest.evidenceGroup.evidence,
            humanityWinnerClaim:
              humanity[latestRequest.chainId]?.humanity?.winnerClaim ?? [],
            registrationEvidenceRevokedReq:
              latestRequest.registrationEvidenceRevokedReq,
            requester: latestRequest.requester,
            revocation: latestRequest.revocation,
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

        {homeChain && hasCurrentWinnerClaim ? (
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
                Date.now() / 1000
                ? "Expired "
                : "Expires "}
              <TimeAgo
                time={
                  humanity[homeChain.id]!.humanity!.registration!.expirationTime
                }
              />
            </span>
            {winnerClaimData.request ? (
              <div className="mt-4 flex items-center justify-center mb-3">
                <Card
                  chainId={winnerClaimData.chainId as SupportedChainId}
                  claimer={winnerClaimData.requestQuery!.claimer}
                  evidence={winnerClaimData.request.evidenceGroup.evidence}
                  humanity={{
                    id: pohId,
                    winnerClaim:
                      humanity[winnerClaimData.chainId as SupportedChainId]!
                        .humanity!.winnerClaim,
                  }}
                  index={winnerClaimData.request.index}
                  requester={winnerClaimData.requestQuery!.requester}
                  revocation={false}
                  registrationEvidenceRevokedReq={""}
                  requestStatus={winnerClaimData.requestStatus as RequestStatus}
                />
              </div>
            ) : null}
            {canRenew ? (
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
            )}

            <ProfileOptimisticProvider
              base={{
                winningStatus: winnerClaimData.status,
                pendingRevocation,
              }}
              storageKey={`profile:${pohId}`}
            >
              <Revoke
                pohId={pohId}
                arbitrationInfo={contractData[homeChain.id].arbitrationInfo!}
                homeChain={homeChain}
                cost={
                  arbitrationCost + BigInt(contractData[homeChain.id].baseDeposit)
                }
              />
              <CrossChain
                claimer={
                  humanity[homeChain.id]!.humanity!.registration!.claimer.id
                }
                contractData={contractData}
                homeChain={homeChain}
                pohId={pohId}
              humanity={humanity}
              lastTransfer={humanity[lastTransferChain.id].outTransfer}
              lastTransferChain={lastTransferChain}
            />
            </ProfileOptimisticProvider>
          </>
        ) : isTransferPendingProfile && transferHomeChain ? (
          <ProfileOptimisticProvider
            base={{
              winningStatus: transferWinningStatus,
              pendingRevocation: false,
            }}
            storageKey={`profile:${pohId}`}
          >
            {currentTransferRequest ? (
              <>
                <span className="text-secondaryText mb-2">
                  Transfer pending. Showing current transfer request.
                </span>
                <div className="mt-4 mb-3 flex items-center justify-center">
                  <Card
                    chainId={currentTransferRequest.chainId}
                    claimer={transferDisplaySource?.claimer || currentTransferRequest.claimer}
                    evidence={transferDisplaySource?.evidence || getDisplayEvidence(
                      currentTransferRequest.evidenceGroup.evidence,
                      humanity[currentTransferRequest.chainId]?.humanity?.winnerClaim?.at(0)
                        ?.evidenceGroup.evidence,
                    )}
                    humanity={{
                      id: pohId,
                      registration:
                        humanity[currentTransferRequest.chainId]?.humanity
                          ?.registration,
                      winnerClaim:
                        humanity[currentTransferRequest.chainId]!.humanity!
                          .winnerClaim,
                    }}
                    index={currentTransferRequest.index}
                    requester={currentTransferRequest.requester}
                    revocation={currentTransferRequest.revocation}
                    registrationEvidenceRevokedReq={
                      currentTransferRequest.registrationEvidenceRevokedReq
                    }
                    requestStatus={currentTransferRequest.requestStatus}
                  />
                </div>
              </>
            ) : null}
            <CrossChain
              claimer={(transferClaimer || pohId) as `0x${string}`}
              contractData={contractData}
              homeChain={transferHomeChain}
              pohId={pohId}
              humanity={humanity}
              lastTransfer={humanity[lastTransferChain.id].outTransfer}
              lastTransferChain={lastTransferChain}
            />
          </ProfileOptimisticProvider>
        ) : (
          <>
            <span className="text-orange mb-6">Not claimed</span>
            {!hasActiveRequests ? (
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
