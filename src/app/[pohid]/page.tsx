import ExternalLink from "components/ExternalLink";
import Card from "components/Request/Card";
import TimeAgo from "components/TimeAgo";
import ChainLogo from "components/ChainLogo";
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
import { HumanityQuery } from "generated/graphql";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { shortenAddress } from "utils/address";
import { machinifyId, prettifyId } from "utils/identifier";
import { getProfileTimelineData } from "data/requestTimeline";
import CrossChain from "./CrossChain";
import Renew from "./Renew";
import Revoke from "./Revoke";
import { getStatus, RequestStatus } from "utils/status";
import { ProfileTimelineSection } from "./TimelineSection";

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
  chainId: SupportedChainId | boolean;
  status: string;
  request: WinnerClaimRequest | undefined;
  exists: boolean;
  requestStatus: RequestStatus;
};

const isTransferArtifactRequest = (request: {
  index: number | string;
  status?: {
    id: string;
  } | null;
}) =>
  request.status?.id === "transferred" ||
  request.status?.id === "transferring" ||
  Number(request.index) <= -100;

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

  const lastEvidenceChain = homeChain
    ? supportedChains.sort((chain1, chain2) => {
        const req1 = humanity[chain1.id]?.humanity?.winnerClaim[0];
        const req2 = humanity[chain2.id]?.humanity?.winnerClaim[0];
        return req2
          ? req1
            ? Number(req2.resolutionTime) - Number(req1.resolutionTime)
            : 1
          : -1;
      })[0]
    : null;

  const retrieveWinnerClaimData = (): WinnerClaimData => {
    let chainId: SupportedChainId | boolean = false;
    let status;
    let request: WinnerClaimRequest | undefined = undefined;
    let exists: boolean = false;
    let requestQuery;
    let requestStatus;
    if (homeChain && lastEvidenceChain) {
      request = humanity[lastEvidenceChain.id].humanity!.winnerClaim[0];
      if (request) {
        requestQuery = humanity[lastEvidenceChain.id]!.humanity!.requests.find(
          (req) => req.index === request!.index,
        );
        requestStatus = getStatus({
          status: { id: requestQuery?.status.id || "resolved" },
          creationTime: requestQuery?.creationTime || 0,
          expirationTime: requestQuery?.expirationTime,
          index: request.index,
          revocation: requestQuery!.revocation,
          winnerParty: requestQuery?.winnerParty,
        }, { humanityLifespan: contractData[lastEvidenceChain.id].humanityLifespan });
        if (requestStatus === RequestStatus.EXPIRED) {
          request = undefined;
        } else {
          exists = true;
          chainId = lastEvidenceChain.id;
          status = requestQuery?.status.id as string;
        }
      }
    }

    return { chainId, status, request, exists, requestStatus } as WinnerClaimData;
  };

  let winnerClaimData: WinnerClaimData = retrieveWinnerClaimData();

  const allRequests = supportedChains.flatMap((chain) =>
    (humanity[chain.id]?.humanity?.requests ?? []).map((request) => ({
      ...request,
      chainId: chain.id,
      requestStatus: getStatus(request, {
        humanityLifespan: contractData[chain.id]?.humanityLifespan,
      }),
    })),
  );

  const timelineRequests = allRequests
    .filter((request) => !isTransferArtifactRequest(request))
    .filter(
      (request) =>
        !(
          winnerClaimData.request &&
          request.index === winnerClaimData.request.index &&
          request.chainId === winnerClaimData.chainId
        ),
    )
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    ) as PoHRequest[];

  const hasPendingRequests = timelineRequests.some((request) =>
    [
      RequestStatus.VOUCHING,
      RequestStatus.PENDING_CLAIM,
      RequestStatus.PENDING_REVOCATION,
      RequestStatus.DISPUTED_CLAIM,
      RequestStatus.DISPUTED_REVOCATION,
    ].includes(request.requestStatus),
  );

  const latestTransferArtifact = allRequests
    .filter((request) => isTransferArtifactRequest(request))
    .sort(
      (requestA, requestB) =>
        Number(requestB.lastStatusChange || requestB.creationTime) -
        Number(requestA.lastStatusChange || requestA.creationTime),
    )[0];

  const lastTransferChain = supportedChains.sort((chain1, chain2) => {
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
  const profileTimelineDataPromise = getProfileTimelineData(pohId, timelineRequests);

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

        <div className="bordered mb-10 w-full max-w-[39rem] rounded-sm">
          <div className="bg-whiteBackground flex flex-col items-center rounded-sm px-4 py-8 sm:px-8">
            {homeChain && winnerClaimData.requestStatus !== RequestStatus.EXPIRED ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-center text-center text-emerald-500">
                    <span>Claimed by</span>
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

                  <span className="text-secondaryText mb-2 text-center">
                    {humanity[homeChain.id]!.humanity!.registration!
                      .expirationTime <
                    Date.now() / 1000
                      ? "Expired "
                      : "Expires "}
                    <TimeAgo
                      time={
                        humanity[homeChain.id]!.humanity!.registration!
                          .expirationTime
                      }
                    />
                  </span>

                  {winnerClaimData.exists && homeChain ? (
                    <div className="mb-6 w-full max-w-[17rem]">
                      <Card
                        chainId={winnerClaimData.chainId as SupportedChainId}
                        claimer={
                          humanity[homeChain.id]!.humanity!.registration!.claimer.id
                        }
                        evidence={winnerClaimData.request!.evidenceGroup.evidence}
                        humanity={{
                          id: pohId,
                          winnerClaim:
                            humanity[winnerClaimData.chainId as SupportedChainId]!
                              .humanity!.winnerClaim,
                        }}
                        index={winnerClaimData.request!.index}
                        requester={
                          humanity[homeChain.id]!.humanity!.registration!.claimer.id
                        }
                        revocation={false}
                        registrationEvidenceRevokedReq={""}
                        requestStatus={winnerClaimData.requestStatus}
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
                    <span className="text-secondaryText mb-4 text-center">
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

                  <Revoke
                    pohId={pohId}
                    arbitrationInfo={contractData[homeChain.id].arbitrationInfo!}
                    homeChain={homeChain}
                    cost={
                      arbitrationCost +
                      BigInt(contractData[homeChain.id].baseDeposit)
                    }
                  />
                </>
              ) : latestTransferArtifact?.status.id === "transferred" ? (
                <div className="w-full">
                  <CrossChain
                    claimer={
                      humanity[lastTransferChain.id]?.humanity!.registration?.claimer
                        .id
                    }
                    contractData={contractData}
                    homeChain={idToChain(getForeignChain(lastTransferChain.id))!}
                    pohId={pohId}
                    humanity={humanity}
                    lastTransfer={humanity[lastTransferChain.id].outTransfer}
                    lastTransferChain={lastTransferChain}
                    winningStatus={"transferred"}
                  />
                </div>
              ) : (
                <>
                  <span className="text-orange mb-6">Not claimed</span>
                  {!hasPendingRequests ? (
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
              )
            }
          </div>
          <div className="bg-whiteBackground border-theme flex items-center justify-between border-t px-4 py-3 text-xs sm:px-6">
            <div className="text-secondaryText flex items-center gap-2">
              <span>Home chain:</span>
              {homeChain ? (
                <span className="text-primaryText flex items-center gap-1">
                  <ChainLogo
                    chainId={homeChain.id}
                    className="fill-primaryText h-3 w-3"
                  />
                  {homeChain.name}
                </span>
              ) : (
                <span className="text-primaryText">Unknown</span>
              )}
            </div>
            {homeChain && winnerClaimData.requestStatus !== RequestStatus.EXPIRED ? (
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
                winningStatus={winnerClaimData.status}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ProfileTimelineSection timelineDataPromise={profileTimelineDataPromise} />
    </div>
  );
}

export default Profile;
