import Vouch from "components/Vouch";
import {
  SupportedChainId,
  paramToChain,
  supportedChains,
  legacyChain,
} from "config/chains";
import { getClaimerData } from "data/claimer";
import { getContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { getHumanityEvents } from "data/humanityEvents";
import {
  OffChainVouch,
  getOffChainVouches,
  getRequestDataRaw,
} from "data/request";
import { getRequestTimelineData } from "data/requestTimeline";
import { ValidVouch, isValidOnChainVouch, isValidVouch } from "data/vouch";
import {
  ClaimerQuery,
  RequestQuery,
  Vouch as VouchQuery,
} from "generated/graphql";
import { Suspense } from "react";
import { EvidenceFile, MetaEvidenceFile, RegistrationFile } from "types/docs";
import { machinifyId, prettifyId } from "utils/identifier";
import { ipfsFetch } from "utils/ipfs";
import type { Address } from "viem";
import { RequestOptimisticProvider } from "optimistic/request";
import type { RequestOptimisticBase } from "optimistic/types";
import { getRequestIdentity } from "data/requestIdentityData";
import ActionBar from "./ActionBar";
import Evidence from "./Evidence";
import OptimisticVouchIndicator from "./OptimisticVouchIndicator";
import {
  RequestInfoSection,
  RequestInfoSectionSkeleton,
  TimelineHistorySection,
  TimelineHistorySectionSkeleton,
} from "./TimelineSection";
import { getStatus } from "utils/status";
import RequestIdentityCard from "./RequestIdentityCard";
import type { RequestPageRequest } from "./RequestIdentityCard.types";

interface PageProps {
  params: Promise<{ pohid: string; chain: string; request: string }>;
}

/**
 * @notice Waits for resolved identity evidence and renders the evidence section.
 * @dev Uses a nested provider to swap in identity evidence while sharing the
 * parent request optimistic state, polling, and reconciliation.
 */
async function RequestEvidenceSection({
  arbitrationInfo,
  chainId,
  humanityEventsPromise,
  optimisticBase,
  pohId,
  request,
  requestIndex,
}: {
  arbitrationInfo: NonNullable<RequestQuery["request"]>["arbitratorHistory"];
  chainId: SupportedChainId;
  humanityEventsPromise: ReturnType<typeof getHumanityEvents>;
  optimisticBase: RequestOptimisticBase;
  pohId: `0x${string}`;
  request: RequestPageRequest;
  requestIndex: number;
}) {
  const humanityEvents = await humanityEventsPromise;
  const identity = await getRequestIdentity({
    humanityEvents,
    pohId,
    chainId,
    request,
  });
  const evidenceList = identity.evidenceGroup.evidence.map((item, index) => ({
    id: item.id ?? `${request.id}-identity-${index}`,
    uri: item.uri,
    creationTime: Number(
      item.creationTime || request.lastStatusChange || request.creationTime,
    ),
    submitter: (item.submitter ||
      identity.requester ||
      request.requester) as Address,
  }));

  return (
    <RequestOptimisticProvider
      base={{
        ...optimisticBase,
        evidenceList,
      }}
    >
      <Evidence
        pohId={pohId}
        requestIndex={requestIndex}
        arbitrationInfo={arbitrationInfo}
      />
    </RequestOptimisticProvider>
  );
}

export default async function Request({ params }: PageProps) {
  const { pohid, chain: chainParam, request: requestParam } = await params;
  const chain = paramToChain(chainParam);

  if (!chain) throw new Error("unsupported chain");

  const pohId = machinifyId(pohid)!;

  const [request, contractData] = await Promise.all([
    getRequestDataRaw(chain.id, pohId, +requestParam),
    getContractData(chain.id),
  ]);
  if (!request) return <span>Error occured</span>;
  if (
    chain.id === legacyChain.id &&
    request.status.id === "vouching" &&
    Number(request.index) <= -1
  )
    return <span>Request not found</span>;

  const arbitrationCost = await getArbitrationCost(
    chain,
    contractData.arbitrationInfo.arbitrator,
    contractData.arbitrationInfo.extraData,
  );
  const requestStatus = getStatus(request, contractData);
  const humanityEventsPromise = getHumanityEvents(pohId);

  let onChainVouches: Array<Address> = [];
  const fetchedOffChainVouches: OffChainVouch[] = await getOffChainVouches(
    chain.id,
    request.claimer.id,
    pohId,
  );
  const offChainVouches: OffChainVouch[] =
    request.status.id === "vouching" ? [...fetchedOffChainVouches] : [];

  if (request.status.id === "vouching") {
    onChainVouches = request.claimer.vouchesReceived
      .filter((v) => v.humanity.id === request.humanity.id)
      .map((v) => v.from.id as Address);

    // If offChain voucher has been registered before, it will appear at subgraph,
    // so we remove it from onChain since the contract has no data of it
    onChainVouches = onChainVouches.filter(
      (onChainVoucher) =>
        offChainVouches.filter((vouch) => vouch.voucher === onChainVoucher)
          .length === 0,
    );
  } else {
    // For any other request status there are registered vouches for this request
    onChainVouches = request.vouches.map((v) => v.voucher.id as Address);
  }

  interface VouchData {
    voucher: Address | undefined;
    name: string | null | undefined;
    pohId: Address | undefined;
    photo: string | undefined;
    vouchStatus: ValidVouch | undefined;
    isOnChain: boolean;
  }

  const prepareVouchData = (
    rawVouches: Record<SupportedChainId, ClaimerQuery>[],
    isOnChain: boolean,
    skipStatusCheck: boolean,
  ): Promise<VouchData>[] => {
    return rawVouches.map(async (rawVoucher) => {
      const out: VouchData = {
        voucher: undefined,
        name: undefined,
        pohId: undefined,
        photo: undefined,
        vouchStatus: undefined,
        isOnChain: isOnChain,
      };
      try {
        const voucherEvidenceChain = supportedChains.find(
          (chain) =>
            rawVoucher[chain.id].claimer &&
            rawVoucher[chain.id].claimer?.registration?.humanity.winnerClaim,
        );
        const relevantChain = !!voucherEvidenceChain
          ? voucherEvidenceChain
          : chain;

        out.name = rawVoucher[relevantChain.id].claimer?.name;
        out.voucher = rawVoucher[relevantChain.id].claimer?.id;
        out.pohId =
          rawVoucher[relevantChain.id].claimer?.registration?.humanity.id;
        if (!out.pohId) out.pohId = out.voucher;
        const uri = rawVoucher[
          relevantChain.id
        ].claimer?.registration?.humanity.winnerClaim
          .at(0)
          ?.evidenceGroup.evidence.at(0)?.uri;

        if (!skipStatusCheck && !isOnChain) {
          out.vouchStatus = await isValidVouch(
            chain.id,
            out.voucher!,
            offChainVouches.find(
              (vouch) =>
                vouch.voucher === rawVoucher[relevantChain.id].claimer?.id,
            )?.expiration,
          );
        } else if (!skipStatusCheck && isOnChain) {
          out.vouchStatus = isValidOnChainVouch(
            request.claimer.vouchesReceived.find(
              (v) =>
                v.from.id === out.voucher! &&
                v.humanity.id === request.humanity.id,
            )! as VouchQuery,
          );
        }

        if (!uri) return out;

        const evFile = await Promise.resolve(ipfsFetch<EvidenceFile>(uri));
        if (!evFile?.fileURI) return out;

        out.photo = (
          await Promise.resolve(ipfsFetch<RegistrationFile>(evFile.fileURI))
        ).photo;
        return out;
      } catch {
        return out;
      }
    });
  };

  const vourchesForData = prepareVouchData(
    await Promise.all([
      ...request.claimer.vouches.map((vouch) => getClaimerData(vouch.for.id)),
    ]),
    true,
    true,
  );
  const vouchersData = prepareVouchData(
    await Promise.all([
      ...offChainVouches.map((vouch) => getClaimerData(vouch.voucher)),
    ]),
    false,
    false,
  ).concat(
    prepareVouchData(
      await Promise.all([
        ...onChainVouches.map((voucher) => getClaimerData(voucher)),
      ]),
      true,
      false,
    ),
  );

  const resolvedVouchersData = await Promise.all(vouchersData);
  const validVouches = resolvedVouchersData.filter(
    (v) => v.vouchStatus?.isValid,
  ).length;

  // Extract used reasons from existing challenges

  const usedReasons = request.challenges.map(
    (challenge) => challenge.reason.id,
  );

  const policyLink = await (async () => {
    try {
      return (
        await Promise.resolve(
          ipfsFetch<MetaEvidenceFile>(
            request.arbitratorHistory.registrationMeta,
          ),
        )
      ).fileURI;
    } catch (e) {
      return null;
    }
  })();

  const timelineDataPromise = getRequestTimelineData(
    pohId,
    chain.id,
    request,
    fetchedOffChainVouches,
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
        <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
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
          <RequestIdentityCard
            chain={chain}
            humanityEventsPromise={humanityEventsPromise}
            policyLink={policyLink}
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
              vourchesForData.find((v) => v) ? (
                <div className="text-secondaryText mt-8 flex flex-col items-center text-center md:items-start md:text-left">
                  This PoHID vouched for
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {vourchesForData.map(async (vouch, idx) => {
                      const vouchLocal = await Promise.resolve(vouch);
                      if (vouchLocal.pohId === undefined) return null;
                      return (
                        <Vouch
                          key={`${vouchLocal.pohId}-${idx}`}
                          isActive={true}
                          reason={undefined}
                          name={vouchLocal.name}
                          photo={vouchLocal.photo}
                          idx={idx}
                          href={`/${prettifyId(vouchLocal.pohId!)}`}
                          pohId={vouchLocal.pohId}
                          address={vouchLocal.pohId}
                          isOnChain={vouchLocal.isOnChain}
                          reducedTooltip={true}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null
            }
            vouchers={
              vouchersData.find((v) => v) ? (
                <div className="text-secondaryText mt-8 flex flex-col items-center text-center md:items-start md:text-left">
                  <span className="flex items-center">
                    {request.status.id === "vouching"
                      ? "Available vouches for this PoHID"
                      : "Vouched for this request"}
                    {request.status.id === "vouching" && (
                      <OptimisticVouchIndicator />
                    )}
                  </span>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {vouchersData.map(async (vouch, idx) => {
                      const vouchLocal = await Promise.resolve(vouch);
                      return (
                        <Vouch
                          key={`${vouchLocal.voucher ?? vouchLocal.pohId}-${idx}`}
                          isActive={
                            request.status.id === "vouching"
                              ? vouchLocal.vouchStatus?.isValid
                              : true
                          }
                          reason={
                            request.status.id === "vouching"
                              ? vouchLocal.vouchStatus?.reason
                              : undefined
                          }
                          name={vouchLocal.name}
                          photo={vouchLocal.photo}
                          idx={idx}
                          href={`/${prettifyId(vouchLocal.pohId!)}`}
                          pohId={vouchLocal.pohId}
                          address={vouchLocal.voucher}
                          isOnChain={vouchLocal.isOnChain}
                          reducedTooltip={request.status.id !== "vouching"}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null
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
      </RequestOptimisticProvider>
      <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
        <Suspense fallback={null}>
          <RequestEvidenceSection
            arbitrationInfo={request.arbitratorHistory}
            chainId={chain.id}
            humanityEventsPromise={humanityEventsPromise}
            optimisticBase={optimisticBase}
            pohId={pohId}
            request={request}
            requestIndex={request.index}
          />
        </Suspense>
      </div>
    </>
  );
}
