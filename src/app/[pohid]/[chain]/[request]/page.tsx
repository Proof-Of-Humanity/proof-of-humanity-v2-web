import { paramToChain, legacyChain } from "config/chains";
import { SubgraphUnavailableError, isAnySubgraphAlive } from "data/chainQuery";
import { getContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { getHumanityEvents } from "data/humanityEvents";
import {
  getHistoricalWinnerClaim,
  getOffChainVouches,
  getRequestPageData,
} from "data/request";
import { getRequestTimelineData } from "data/requestTimeline";
import { getRequestVouchData } from "data/vouch";
import { Suspense } from "react";
import { machinifyId, prettifyId } from "utils/identifier";
import type { Address } from "viem";
import { RequestOptimisticProvider } from "optimistic/request";
import type { RequestOptimisticBase } from "optimistic/types";
import ActionBar from "./ActionBar";
import {
  RequestInfoSection,
  RequestInfoSectionSkeleton,
  TimelineHistorySection,
  TimelineHistorySectionSkeleton,
} from "./TimelineSection";
import { getStatus } from "utils/status";
import RequestIdentityCard from "./RequestIdentityCard";
import RequestEvidenceSection from "./RequestEvidenceSection";
import {
  RequestVouchersSection,
  RequestVouchSectionSkeleton,
  VouchedForSection,
} from "./RequestVouchSection";
import RequestPunishedVouchNotice from "components/RequestPunishedVouchNotice";
import DegradedRequestPage from "./DegradedRequestPage";
import { RequestNotFoundCard } from "./RequestErrorState";

const ContractMetadataUnavailableNotice = () => (
  <div className="bg-lightOrange border-orange text-secondaryText mb-4 rounded border px-4 py-3 text-center text-sm font-normal leading-6">
    Contract metadata is temporarily unavailable, so request status and actions
    are hidden for now. The request data below may still be useful.
  </div>
);

interface PageProps {
  params: Promise<{ pohid: string; chain: string; request: string }>;
}

export default async function Request({ params }: PageProps) {
  const { pohid, chain: chainParam, request: requestParam } = await params;
  const chain = paramToChain(chainParam);

  if (!chain) throw new Error("unsupported chain");

  const pohId = machinifyId(pohid)!;

  const [requestResult, contractResult] = await Promise.allSettled([
    getRequestPageData(chain.id, pohId, +requestParam),
    getContractData(chain.id),
  ]);

  if (requestResult.status === "rejected") {
    console.error(
      `Request page data failed on ${chain.name}:`,
      requestResult.reason,
    );
    // With every subgraph down there is no degraded view worth rendering, so
    // surface a real error; a single dead chain degrades to a partial view
    // built from the live chains' records.
    if (!(await isAnySubgraphAlive()))
      throw new SubgraphUnavailableError([requestResult.reason]);
    return <DegradedRequestPage chain={chain} pohId={pohId} />;
  }

  const fetchedRequest = requestResult.value;
  if (!fetchedRequest) return <RequestNotFoundCard chainName={chain.name} />;

  const needsHistoricalIdentity =
    fetchedRequest.revocation || Number(fetchedRequest.index) <= -100;
  const historicalIdentity = needsHistoricalIdentity
    ? await getHistoricalWinnerClaim(pohId, fetchedRequest.lastStatusChange)
    : null;
  const identitySource = historicalIdentity || fetchedRequest;
  const identity = {
    claimer: identitySource.claimer,
    creationTime: identitySource.creationTime,
    evidenceGroup: identitySource.evidenceGroup,
    lastStatusChange: identitySource.lastStatusChange,
    requester: identitySource.requester,
  };
  const evidenceSource = fetchedRequest.revocation ? fetchedRequest : identity;
  const requestEvidence = {
    evidence: evidenceSource.evidenceGroup.evidence,
    requester: evidenceSource.requester,
  };
  const request = fetchedRequest;
  if (
    chain.id === legacyChain.id &&
    request.status.id === "vouching" &&
    Number(request.index) <= -1
  )
    return <RequestNotFoundCard chainName={chain.name} />;

  const offChainVouches = await getOffChainVouches(
    chain.id,
    request.claimer.id,
    pohId,
  );
  const vouchDataPromise = getRequestVouchData(
    chain.id,
    request,
    offChainVouches,
  );

  if (contractResult.status === "rejected") {
    console.error(
      `Request contract metadata failed on ${chain.name}:`,
      contractResult.reason,
    );
    return (
      <div className="content flex flex-col justify-center font-semibold">
        <ContractMetadataUnavailableNotice />
        <RequestIdentityCard
          chain={chain}
          identity={identity}
          policyMetaEvidenceUri={request.arbitratorHistory.registrationMeta}
          pohId={pohId}
          request={request}
          requestInfo={null}
          vouchedFor={
            <Suspense
              fallback={
                <RequestVouchSectionSkeleton title="This PoHID vouched for" />
              }
            >
              <VouchedForSection chain={chain} request={request} />
            </Suspense>
          }
          vouchers={
            <Suspense
              fallback={
                <RequestVouchSectionSkeleton
                  title={
                    request.status.id === "vouching"
                      ? "Available vouches for this PoHID"
                      : "Vouched for this request"
                  }
                />
              }
            >
              <RequestVouchersSection
                chain={chain}
                request={request}
                vouchDataPromise={vouchDataPromise}
              />
            </Suspense>
          }
          timeline={null}
        />
      </div>
    );
  }

  const contractData = contractResult.value;
  const arbitrationCost = await getArbitrationCost(
    chain,
    contractData.arbitrationInfo.arbitrator,
    contractData.arbitrationInfo.extraData,
  );
  const requestStatus = getStatus(request, contractData);
  const punishedVouchSource = request.punishedVouchSourceRequest;
  const punishedVouchSourceHref = punishedVouchSource
    ? `/${prettifyId(
        punishedVouchSource.humanity.id,
      )}/${chain.name.toLowerCase()}/${punishedVouchSource.index}`
    : null;
  const punishedVouchReason =
    request.punishedVouchReason?.id === "identityTheft"
      ? "Identity Theft"
      : "Sybil Attack";
  const humanityEventsPromise = getHumanityEvents(pohId);
  const { onChainVouches, validVouches } = await vouchDataPromise;
  // Extract used reasons from existing challenges

  const usedReasons = request.challenges.map(
    (challenge) => challenge.reason.id,
  );

  const timelineDataPromise = getRequestTimelineData(
    pohId,
    chain.id,
    request,
    offChainVouches,
    humanityEventsPromise,
    contractData.humanityLifespan,
  );
  const funded =
    request.index >= 0
      ? BigInt(request.challenges[0]?.rounds[0]?.requesterFund.amount ?? 0)
      : 0n;
  const currentChallenge = request.challenges.at(-1);
  const requestStorageKey = `request:${pohId}:${chain.id}:${request.index}`;
  const optimisticBase = {
    status: request.status.id,
    requestStatus,
    lastStatusChange: Number(request.lastStatusChange),
    funded,
    totalCost: BigInt(contractData.baseDeposit) + arbitrationCost,
    validVouches,
    onChainVouches,
    offChainVouches,
    evidenceList: request.evidenceGroup.evidence.map((item) => ({
      id: item.id,
      uri: item.uri,
      creationTime: Number(item.creationTime),
      submitter: item.submitter as Address,
    })),
    revocation: request.revocation,
  } satisfies RequestOptimisticBase;

  //const policyUpdate = request.arbitratorHistory.updateTime;

  const nowSec = Math.floor(Date.now() / 1000);
  const registration = request.humanity.registration;
  const humanityClaimed =
    !request.revocation &&
    !!registration &&
    Number(registration.expirationTime) > nowSec &&
    (registration.claimer.id as string).toLowerCase() !==
      (request.claimer.id as string).toLowerCase();
  const anotherClaimPending =
    !request.revocation && Number(request.humanity.nbPendingRequests ?? 0) > 1;

  return (
    <>
      <RequestOptimisticProvider
        base={optimisticBase}
        storageKey={requestStorageKey}
      >
        <>
          <div className="content mx-auto !mb-4 flex w-[92vw] max-w-[1500px] flex-col justify-center gap-4 font-semibold sm:w-[84vw] md:w-[76vw]">
            <ActionBar
              arbitrationCost={arbitrationCost}
              index={request.index}
              requester={request.requester}
              contractData={contractData}
              pohId={pohId}
              revocation={request.revocation}
              currentChallenge={currentChallenge}
              arbitrationHistory={request.arbitratorHistory}
              humanityExpirationTime={request.expirationTime}
              usedReasons={usedReasons}
              humanityClaimed={humanityClaimed}
              anotherClaimPending={anotherClaimPending}
            />
            {punishedVouchSourceHref ? (
              <div className="w-full">
                <RequestPunishedVouchNotice
                  reason={punishedVouchReason}
                  sourceRequestHref={punishedVouchSourceHref}
                  timestamp={request.punishedVouchTimestamp}
                />
              </div>
            ) : null}
            <RequestIdentityCard
              chain={chain}
              identity={identity}
              policyMetaEvidenceUri={request.arbitratorHistory.registrationMeta}
              pohId={pohId}
              request={request}
              requestInfo={
                <div className="mb-2 flex flex-col-reverse items-center justify-center md:flex-row md:items-stretch md:justify-between">
                  <Suspense fallback={<RequestInfoSectionSkeleton />}>
                    <RequestInfoSection
                      chainId={chain.id}
                      timelineDataPromise={timelineDataPromise}
                    />
                  </Suspense>
                </div>
              }
              vouchedFor={
                <Suspense
                  fallback={
                    <RequestVouchSectionSkeleton title="This PoHID vouched for" />
                  }
                >
                  <VouchedForSection chain={chain} request={request} />
                </Suspense>
              }
              vouchers={
                <Suspense
                  fallback={
                    <RequestVouchSectionSkeleton
                      title={
                        request.status.id === "vouching"
                          ? "Available vouches for this PoHID"
                          : "Vouched for this request"
                      }
                    />
                  }
                >
                  <RequestVouchersSection
                    chain={chain}
                    request={request}
                    vouchDataPromise={vouchDataPromise}
                  />
                </Suspense>
              }
              timeline={
                <Suspense fallback={<TimelineHistorySectionSkeleton />}>
                  <TimelineHistorySection
                    timelineDataPromise={timelineDataPromise}
                  />
                </Suspense>
              }
            />
          </div>
          <div className="content mx-auto !mt-0 flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
            <Suspense fallback={null}>
              <RequestEvidenceSection
                arbitrationInfo={request.arbitratorHistory}
                evidenceSource={requestEvidence}
                optimisticBase={optimisticBase}
                pohId={pohId}
                request={request}
              />
            </Suspense>
          </div>
        </>
      </RequestOptimisticProvider>
    </>
  );
}
