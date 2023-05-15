import cn from "classnames";
import { ChainId } from "enums/ChainId";
import { PoHContract } from "enums/PoHContract";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PastRequest as PastRequestType,
  PendingRequest as PendingRequestType,
} from "api/types";
import { useGateways } from "api/useGateways";
import { useHumanity } from "api/useHumanity";
import ProofOfHumanityLogo from "assets/svg/ProofOfHumanityLogo.svg";
import ALink from "components/ALink";
import Modal from "components/Modal";
import PageLoader from "components/PageLoader";
import TimeAgo from "components/TimeAgo";
import { CHAIN, TOKEN_CHAIN, supportedChainIds } from "constants/chains";
import { CONTRACT } from "constants/contracts";
import { Status } from "generated/graphql";
import Card from "modules/card/Individual";
import Transfer from "modules/crosschain/Transfer";
import Update from "modules/crosschain/Update";
import Revoke from "modules/humanity/Revoke";
import TokenAccordion from "modules/token";
import { explorerLink, shortenAddress } from "utils/address";
import { machinifyId } from "utils/identifier";

interface TransferState {
  foreignProxy: string;
  senderChainId: ChainId;
  receivingChainId: ChainId;
  transferHash: string;
  transferTimestamp: string;
  received: boolean;
}

const Humanity: React.FC = () => {
  const { humanity: humanityId } = useParams();
  const humanityAllChains = useHumanity(humanityId && machinifyId(humanityId));

  const [homeChain, setHomeChain] = useState<ChainId>();
  const [lastEvidenceChain, setLastEvidenceChain] = useState<ChainId>();
  const [pendingRequests, setPendingRequests] = useState<PendingRequestType[]>(
    []
  );
  const [pastRequests, setPastRequests] = useState<PendingRequestType[]>([]);
  const [transferState, setTransferState] = useState<TransferState>();
  const gateways = useGateways();

  const winnerClaimRequest =
    lastEvidenceChain &&
    humanityAllChains![lastEvidenceChain]!.humanity!.winnerClaimRequest[0];

  const updateTransferState = async () => {
    if (!humanityAllChains || !gateways) return;

    const lastTransferChain = supportedChainIds.sort((chain1, chain2) => {
      const out1 = humanityAllChains[chain1]?.outTransfer;
      const out2 = humanityAllChains[chain2]?.outTransfer;
      return out2
        ? out1
          ? out2.transferTimestamp - out1.transferTimestamp
          : 1
        : -1;
    })[0];

    if (
      !lastTransferChain ||
      !humanityAllChains[lastTransferChain]?.outTransfer
    )
      return;

    const { transferHash, foreignProxy, transferTimestamp } =
      humanityAllChains[lastTransferChain].outTransfer!;

    setTransferState({
      transferHash,
      foreignProxy,
      transferTimestamp,
      senderChainId: lastTransferChain,
      receivingChainId: supportedChainIds.find(
        (chainId) =>
          CONTRACT[PoHContract.CROSS_CHAIN_POH][chainId].toLowerCase() ===
          foreignProxy
      )!,
      received: !!supportedChainIds.find(
        (c) => CONTRACT[PoHContract.CROSS_CHAIN_POH][c] === foreignProxy
      ),
    });
  };

  useEffect(() => {
    if (!humanityAllChains) return;

    console.log({ humanityAllChains });

    setHomeChain(
      supportedChainIds.find(
        (chain) => humanityAllChains[chain]?.humanity?.claimed
      )
    );

    const lastEvChain = supportedChainIds.sort((chain1, chain2) => {
      const req1 = humanityAllChains[chain1]?.humanity?.winnerClaimRequest[0];
      const req2 = humanityAllChains[chain2]?.humanity?.winnerClaimRequest[0];
      return req2 ? (req1 ? req2.resolutionTime - req1.resolutionTime : 1) : -1;
    })[0];

    setLastEvidenceChain(
      humanityAllChains[lastEvChain]?.humanity?.winnerClaimRequest[0]
        ? lastEvChain
        : undefined
    );

    setPendingRequests(
      supportedChainIds.reduce<PendingRequestType[]>(
        (acc, chain) => [
          ...acc,
          ...(humanityAllChains[chain].humanity
            ? humanityAllChains[chain]!.humanity!.pendingRequests.filter(
                ({ status }: { status: Status }) => status !== Status.Withdrawn
              ).map((req: PendingRequestType) => ({ ...req, chainId: chain }))
            : []),
        ],
        []
      )
    );

    setPastRequests(
      supportedChainIds.reduce<PastRequestType[]>(
        (acc, chain) => [
          ...acc,
          ...(humanityAllChains[chain].humanity
            ? humanityAllChains[chain]!.humanity!.pastRequests.map(
                (req: PastRequestType) => ({ ...req, chainId: chain })
              )
            : []),
        ],
        []
      )
    );

    updateTransferState();
  }, [humanityAllChains]);

  if (!humanityId) return null;
  if (!humanityAllChains) return <PageLoader />;

  const HomeChainLogo = (homeChain && CHAIN[homeChain].Logo)!;

  return (
    <div className="content">
      <div className="mt-24 paper pt-20 relative flex flex-col items-center">
        <div className="absolute bordered left-1/2 -top-16 -translate-x-1/2 rounded-full shadow">
          <div className="w-32 h-32 px-6 pt-5 rounded-full bg-white">
            <ProofOfHumanityLogo />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">POH ID</span>
          <span className="mb-12 font-semibold text-xl">{humanityId}</span>
        </div>

        {lastEvidenceChain && homeChain ? (
          <>
            <div className="mb-2 flex text-emerald-500">
              Claimed by
              <ALink
                className="ml-2 underline underline-offset-2"
                href={explorerLink(
                  humanityAllChains[homeChain]!.humanity!.owner!.id,
                  homeChain
                )}
              >
                {shortenAddress(
                  humanityAllChains[homeChain]!.humanity!.owner!.id
                )}
              </ALink>
            </div>

            <Revoke humanity={humanityId} homeChain={homeChain} />

            {humanityAllChains[TOKEN_CHAIN].humanity?.id && (
              <TokenAccordion
                pohName={
                  humanityAllChains[lastEvidenceChain].humanity?.owner?.name ??
                  "Profile"
                }
                humanity={humanityAllChains[TOKEN_CHAIN].humanity}
              />
            )}

            <div className="w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t">
              <div className="flex">
                <span className="text-slate-500">Home chain</span>
                <span className="flex font-semibold">
                  <HomeChainLogo className="w-6 h-6 mx-1" />
                  {CHAIN[homeChain].NAME}
                </span>
              </div>

              <Transfer homeChain={homeChain} />

              <Update
                humanityAllChains={humanityAllChains}
                homeChain={homeChain}
              />

              <div className="font-bold">
                <span className="mr-2 font-normal text-slate-500">
                  Expiration:
                </span>
                <TimeAgo
                  time={humanityAllChains[homeChain].humanity?.expirationTime}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="mb-6 text-theme">Not claimed</span>
            <Link to={`/claim/${humanityId}`} className="btn-main w-48 mb-6">
              Claim humanity
            </Link>
          </>
        )}

        {transferState && (
          <Modal
            trigger={
              <button className="m-4 p-2 border-2 border-blue-500 text-blue-500 font-bold">
                ⏳ Pending transfer
              </button>
            }
            header="Last transfer"
          >
            <div className="paper p-4 flex flex-col">
              <span>
                {CHAIN[transferState.senderChainId].NAME} ▶{" "}
                {CHAIN[transferState.receivingChainId].NAME}
              </span>
              <TimeAgo time={parseInt(transferState.transferTimestamp)} />
              <span>Received: {String(transferState.received)}</span>
              <span>
                Transfer hash: {transferState.transferHash.substring(0, 12)}...
              </span>
            </div>
          </Modal>
        )}
      </div>

      <div className={"flex flex-col sm:flex-row sm:gap-4"}>
        {homeChain && winnerClaimRequest && (
          <div>
            <div className="p-4 mt-4 mb-1">Owner</div>
            <div
              className={cn("grid", {
                "gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4":
                  !pendingRequests.length,
              })}
            >
              <Card
                request={{
                  ...winnerClaimRequest,
                  chainId: lastEvidenceChain,
                  revocation: false,
                  status: Status.Resolved,
                  requester: humanityAllChains[homeChain]!.humanity!.owner!.id,
                  humanity: humanityAllChains[homeChain]!.humanity!,
                  claimer:
                    humanityAllChains[lastEvidenceChain]!.humanity!.owner!,
                }}
              />
            </div>
          </div>
        )}
        {pendingRequests.length > 0 && (
          <div>
            <div className="p-4 mt-4 mb-1">
              {pendingRequests.length} pending request
              {pendingRequests.length !== 1 && "s"}
            </div>
            <div
              className={cn(
                "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
                homeChain && winnerClaimRequest
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              )}
            >
              {pendingRequests.map((req, index) => (
                <Card
                  key={index}
                  request={{
                    ...req,
                    humanity: humanityAllChains[req.chainId]!.humanity!,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {pastRequests.length > 0 && (
        <>
          <div className="p-4 mt-8 mb-1">
            {pastRequests.length} past request
            {pastRequests.length !== 1 && "s"}
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pastRequests.map((req, index) => (
              <Card
                key={index}
                request={{
                  ...req,
                  humanity: humanityAllChains![req.chainId]!.humanity!,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Humanity;
