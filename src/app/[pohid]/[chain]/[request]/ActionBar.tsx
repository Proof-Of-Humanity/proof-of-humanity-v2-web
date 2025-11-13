"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import ExternalLink from "components/ExternalLink";
import TimeAgo from "components/TimeAgo";
import ActionButton from "components/ActionButton";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { getMyData } from "data/user";
import { RequestQuery } from "generated/graphql";
import useChainParam from "hooks/useChainParam";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { getStatusLabel, getStatusColor, RequestStatus } from "utils/status";
import { ActionType } from "utils/enums";
import { Address, Hash, formatEther, hexToSignature } from "viem";
import { useAccount, useChainId } from "wagmi";
import Appeal from "./Appeal";
import Challenge from "./Challenge";
import FundButton from "./Funding";
import RemoveVouch from "./RemoveVouch";
import Vouch from "./Vouch";

enableReactUse();

// const encodeClaimToAdvance = (claimer: Address, vouchers: Address[]) =>
//   encodeFunctionData<typeof abis.ProofOfHumanity, "advanceState">({
//     abi: abis.ProofOfHumanity,
//     functionName: "advanceState",
//     args: [claimer, vouchers, []],
//   });

interface ActionBarProps {
  pohId: Hash;
  arbitrationCost: bigint;
  requester: Address;
  revocation: boolean;
  status: string;
  funded: bigint;
  index: number;
  lastStatusChange: number;
  contractData: ContractData;
  currentChallenge?: ArrayElement<
    NonNullable<NonNullable<RequestQuery>["request"]>["challenges"]
  >;
  advanceRequestsOnChainVouches?: { claimer: Address; vouchers: Address[] }[];
  onChainVouches: Address[];
  offChainVouches: { voucher: Address; expiration: number; signature: Hash }[];
  arbitrationHistory: {
    __typename?: "ArbitratorHistory" | undefined;
    updateTime: any;
    registrationMeta: string;
    id: string;
    arbitrator: any;
    extraData: any;
  };
  requestStatus: RequestStatus;
  humanityExpirationTime?: number;
  validVouches: number;
  usedReasons?: string[];
}

export default function ActionBar({
  pohId,
  requester,
  index,
  revocation,
  status,
  requestStatus,
  funded,
  lastStatusChange,
  arbitrationCost,
  contractData,
  currentChallenge,
  onChainVouches,
  offChainVouches,
  // advanceRequestsOnChainVouches,
  arbitrationHistory,
  humanityExpirationTime,
  validVouches,
  usedReasons = [],
}: ActionBarProps) {
  const chain = useChainParam()!;
  const { address } = useAccount();
  const web3Loaded = useWeb3Loaded();
  const userChainId = useChainId();
  const { data: me } = useSWR(address, getMyData);
  const router = useRouter();

  const hasWarnedOffchain = useRef(false);

  const {didIVouchFor, isVouchOnchain} = useMemo(() => {
    const lowerAddr = address?.toLowerCase();
    const onChainMatch = onChainVouches.some(
      (voucherAddress) => voucherAddress.toLowerCase() === lowerAddr,
    );
    const offChainMatch = offChainVouches.some(
      (voucher) => voucher.voucher.toLowerCase() === lowerAddr,
    );
    return { didIVouchFor: onChainMatch || offChainMatch, isVouchOnchain: onChainMatch };
  }, [onChainVouches, offChainVouches, address]);

  const action = useMemo(() => {
    if (status === "resolved" || status === "withdrawn") return ActionType.NONE;
    if (index < 0 && index > -100) return ActionType.OLD_ACTIVE;
    if (status === "disputed") return ActionType.DISPUTED;
    if (status === "vouching") {
      if (funded < arbitrationCost + BigInt(contractData.baseDeposit)) return ActionType.FUND;
      if (validVouches >= contractData.requiredNumberOfVouches) return ActionType.ADVANCE;
      if (
        onChainVouches.length + offChainVouches.length >= 0 &&
        didIVouchFor &&
        isVouchOnchain
      )
        return ActionType.REMOVE_VOUCH;
      return ActionType.VOUCH;
    }
    if (status == "resolving")
      return +lastStatusChange + +contractData.challengePeriodDuration < Date.now() / 1000
        ? ActionType.EXECUTE
        : ActionType.CHALLENGE;
    return ActionType.NONE;
  }, [
    status,
    index,
    funded,
    arbitrationCost,
    contractData.baseDeposit,
    validVouches,
    contractData.requiredNumberOfVouches,
    onChainVouches,
    offChainVouches,
    didIVouchFor,
    isVouchOnchain,
    lastStatusChange,
    contractData.challengePeriodDuration,
  ]);

  const [canAdvance, setCanAdvance] = useState(true);

  useEffect(() => {
    const shouldWarn = didIVouchFor && !isVouchOnchain && userChainId === chain.id;
    if (shouldWarn && !hasWarnedOffchain.current) {
      toast.error("Off chain vouches cannot be removed", { toastId: "offchain-vouch" });
      hasWarnedOffchain.current = true;
    }
  }, [didIVouchFor, isVouchOnchain, userChainId, chain.id]);


  const [prepareExecute, execute, executeStatus] = usePoHWrite(
    "executeRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess() {
          toast.success("Request executed successfully");
          setTimeout(() => router.refresh(), 500);
        },
      }),
      [router],
    ),
  );
  const [prepareAdvance, advanceFire, advanceStatus] = usePoHWrite(
    "advanceState",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess() {
          toast.success("Request advanced to resolving state");
          setTimeout(() => router.refresh(), 500);
        },
      }),
      [router],
    ),
  );
  const [prepareWithdraw, withdraw] = usePoHWrite(
    "withdrawRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess() {
          toast.success("Request withdrawn successfully");
        },
      }),
      [],
    ),
  );

  const isAdvanceLoading =
    advanceStatus.write === "pending" ||
    (advanceStatus.write === "success" && advanceStatus.transaction === "pending");
  const isExecuteLoading =
    executeStatus.write === "pending" ||
    (executeStatus.write === "success" && executeStatus.transaction === "pending");

  const isAdvancePrepareError = advanceStatus.prepare === "error";
  const isExecutePrepareError = executeStatus.prepare === "error";
  useEffect(() => {
    if(!address || userChainId !== chain.id) return;
    if (action === ActionType.ADVANCE && !revocation) {
        prepareAdvance({
          args: [
            requester,
            onChainVouches,
            offChainVouches.map((v) => {
              const sig = hexToSignature(v.signature);
              return {
                expirationTime: v.expiration,
                v: Number(sig.v),
                r: sig.r,
                s: sig.s,
              };
            }),
          ],
        });
        setCanAdvance(true);
    }
    if (action === ActionType.EXECUTE){
      prepareExecute({ args: [pohId, BigInt(index)] });
    }
  }, [
    address,
    prepareExecute,
    action,
    requester,
    revocation,
    chain,
    userChainId,
    canAdvance,
  ]);

  useEffect(() => {
    if (
      !revocation &&
      chain.id === userChainId &&
      requester === address?.toLowerCase() &&
      (action === ActionType.VOUCH ||
        action === ActionType.FUND ||
        action === ActionType.ADVANCE)
    )
      prepareWithdraw();
  }, [
    address,
    prepareWithdraw,
    action,
    requester,
    revocation,
    chain,
    userChainId,
  ]);

  const totalCost = BigInt(contractData.baseDeposit) + arbitrationCost;
  
  const statusColor = getStatusColor(requestStatus);

  return (
    <div className="paper border-stroke bg-whiteBackground text-primaryText flex flex-col items-center justify-between gap-[12px] px-[24px] py-[24px] md:flex-row lg:gap-[20px]">
      <div className="flex items-center">
        <span className="mr-4">Status</span>
        <span
          className={`rounded-full px-3 py-1 text-white bg-status-${statusColor}`}
        >
          {getStatusLabel(requestStatus, 'actionBar')}
        </span>
      </div>
      <div className="flex w-full flex-col justify-between gap-[12px] font-normal md:flex-row md:items-center">
        {web3Loaded &&
          (action === ActionType.REMOVE_VOUCH ||
            action === ActionType.VOUCH ||
            action === ActionType.FUND) && (
            <>
              <div className="flex gap-6">
                <span className="text-slate-400">
                  It needs{" "}
                  <strong className={`text-status-${statusColor}`}>
                    {contractData.requiredNumberOfVouches}
                  </strong>{" "}
                  {+contractData.requiredNumberOfVouches === 1
                    ? "vouch"
                    : "vouches"}{" "}
                  to proceed
                  {!!(totalCost - funded) && (
                    <>
                      {" + "}
                      <strong className={`text-status-${statusColor}`}>
                        {formatEther(totalCost - funded)}{" "}
                        {chain.nativeCurrency.symbol}
                      </strong>{" "}
                      to complete the initial deposit
                    </>
                  )}
                </span>
              </div>

              <div className="flex gap-4">
                {requester.toLocaleLowerCase() === address?.toLowerCase() ? (
                  <>
                    {action === ActionType.FUND && (
                      <FundButton
                        pohId={pohId}
                        totalCost={
                          BigInt(contractData.baseDeposit) + arbitrationCost
                        }
                        index={index}
                        funded={funded}
                      />
                    )}
                    <button
                      disabled={userChainId !== chain.id}
                      className="btn-sec mb-2"
                      onClick={withdraw}
                    >
                      Withdraw
                    </button>
                  </>
                ) : !didIVouchFor ? (
                  <Vouch
                    pohId={pohId}
                    claimer={requester}
                    web3Loaded={web3Loaded}
                    me={me}
                    chain={chain}
                    address={address}
                  />
                ) : isVouchOnchain ? (
                  <RemoveVouch
                    requester={requester}
                    pohId={pohId}
                    web3Loaded={web3Loaded}
                    chain={chain}
                    userChainId={userChainId}
                  />
                ) : null}
              </div>
            </>
          )}

        {web3Loaded && action === ActionType.ADVANCE && (
          <>
            <span className="text-slate-400">Ready to advance</span>

            <div className="flex gap-4">
              {requester.toLocaleLowerCase() === address?.toLowerCase() ? (
                <button
                  disabled={userChainId !== chain.id}
                  className="btn-sec mb-2"
                  onClick={withdraw}
                >
                  Withdraw
                </button>
              ) : !didIVouchFor ? (
                <Vouch
                  pohId={pohId}
                  claimer={requester}
                  web3Loaded={web3Loaded}
                  me={me}
                  chain={chain}
                  address={address}
                />
              ) : isVouchOnchain ? (
                <RemoveVouch
                  requester={requester}
                  pohId={pohId}
                  web3Loaded={web3Loaded}
                  chain={chain}
                  userChainId={userChainId}
                />
              ) : null}
              <ActionButton
                disabled={isAdvancePrepareError || userChainId !== chain.id || !canAdvance}
                isLoading={isAdvanceLoading}
                onClick={advanceFire}
                label={isAdvanceLoading ? "Advancing" : "Advance"}
                tooltip={isAdvancePrepareError ? "Advance not possible, please try again" : undefined}
                className="mb-2"
              />
            </div>
          </>
        )}
        {action === ActionType.EXECUTE && (
          <>
            <span className="text-slate-400">Ready to finalize.</span>
            <div className="flex flex-col justify-between gap-4 font-normal md:flex-row md:items-center">
              <ActionButton
                disabled={isExecutePrepareError || userChainId !== chain.id}
                isLoading={isExecuteLoading}
                onClick={execute}
                label={isExecuteLoading ? "Executing" : "Execute"}
                tooltip={isExecutePrepareError ? "Execute not possible, please try again" : undefined}
                className="mb-2"
              />
            </div>
          </>
        )}

        {action === ActionType.CHALLENGE && (
          <>
            <div className="text-slate-400">
              Challenge period end:{" "}
              <TimeAgo
                time={lastStatusChange + +contractData.challengePeriodDuration}
              />
            </div>

            <Challenge
              pohId={pohId}
              requestIndex={index}
              revocation={revocation}
              arbitrationCost={arbitrationCost}
              arbitrationInfo={contractData.arbitrationInfo!}
              usedReasons={usedReasons}
            />
          </>
        )}

        {action === ActionType.DISPUTED && !!currentChallenge && (
          <>
            <span className="text-slate-400">
              The request was challenged
              {!revocation && (
                <>
                  {" "}
                  for{" "}
                  <strong className="text-status-challenged capitalize">
                    {currentChallenge.reason.id}
                  </strong>
                </>
              )}
              .
            </span>

            <div className="flex gap-4 flex-wrap lg:flex-nowrap ">
              <Appeal
                pohId={pohId}
                requestIndex={index}
                disputeId={currentChallenge.disputeId}
                arbitrator={arbitrationHistory.arbitrator}
                extraData={arbitrationHistory.extraData}
                contributor={address!}
                claimer={requester}
                challenger={currentChallenge.challenger?.id}
                currentChallenge={currentChallenge}
                chainId={chain.id}
                revocation={revocation}
                requestStatus={requestStatus}
              />

              <ExternalLink
                href={`https://resolve.kleros.io/${chain.id}/cases/${currentChallenge.disputeId}`}
                className="btn-main gradient h-[48px] rounded
                items-center
                justify-center
                p-2
                whitespace-nowrap
                "
              >
                View case #{currentChallenge.disputeId}
              </ExternalLink>
            </div>
          </>
        )}

        {status === "resolved" && (
          <span>
          {requestStatus === RequestStatus.EXPIRED ? 
          "Request has expired" : 
          requestStatus === RequestStatus.REJECTED ?
          "Request was rejected" : "Request was accepted"}
          <TimeAgo
              className={`ml-1 text-status-${statusColor}`}
              time={requestStatus === RequestStatus.EXPIRED 
                ? humanityExpirationTime!
                : lastStatusChange}
            />
          .
          </span>
        )}

        {index < 0 && index > -100 && (
          <span>
            Check submission on
            <ExternalLink
              className={`ml-1 text-status-${statusColor} ml-2 underline underline-offset-2`}
              href={`https://app.proofofhumanity.id/profile/${pohId}`}
            >
              old interface
            </ExternalLink>
            .
          </span>
        )}
      </div>
    </div>
  );
}
