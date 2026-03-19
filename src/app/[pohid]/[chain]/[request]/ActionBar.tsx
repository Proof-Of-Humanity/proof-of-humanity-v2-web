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
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { getStatusLabel, getStatusColor, RequestStatus } from "utils/status";
import { ActionType } from "utils/enums";
import { Address, Hash, formatEther, hexToSignature } from "viem";
import { useAccount, useChainId } from "wagmi";
import { idToChain } from "config/chains";
import Appeal from "./Appeal";
import Challenge from "./Challenge";
import FundButton from "./Funding";
import RemoveVouch from "./RemoveVouch";
import Vouch from "./Vouch";
import { applyOptimisticWriteSuccess } from "optimistic/applyOptimisticWriteSuccess";
import { useRequestOptimistic } from "optimistic/request";

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
  requestStatus,
  lastStatusChange,
  arbitrationCost,
  contractData,
  currentChallenge,
  // advanceRequestsOnChainVouches,
  arbitrationHistory,
  humanityExpirationTime,
  usedReasons = [],
}: ActionBarProps) {
  const chain = useChainParam()!;
  const { address } = useAccount();
  const web3Loaded = useWeb3Loaded();
  const userChainId = useChainId();
  const { data: me } = useSWR(address, getMyData);
  const router = useRouter();
  const requestOptimistic = useRequestOptimistic();
  const effectiveStatus = requestOptimistic.effective.status;
  const effectiveRequestStatus = requestOptimistic.effective.requestStatus;
  const effectiveFunded = requestOptimistic.effective.funded;
  const effectiveValidVouches = requestOptimistic.effective.validVouches;
  const effectiveOnChainVouches = requestOptimistic.effective.onChainVouches;
  const effectiveOffChainVouches = requestOptimistic.effective.offChainVouches;
  const pendingChallenge = requestOptimistic.effective.pendingChallenge;

  const { didIVouchFor, isVouchOnchain } = useMemo(() => {
    const lowerAddr = address?.toLowerCase();
    const onChainMatch = effectiveOnChainVouches.some(
      (voucherAddress) => voucherAddress.toLowerCase() === lowerAddr,
    );
    const offChainMatch = effectiveOffChainVouches.some(
      (voucher) => voucher.voucher.toLowerCase() === lowerAddr,
    );
    return { didIVouchFor: onChainMatch || offChainMatch, isVouchOnchain: onChainMatch };
  }, [effectiveOnChainVouches, effectiveOffChainVouches, address]);

  const action = useMemo(() => {
    if (effectiveStatus === "resolved" || effectiveStatus === "withdrawn")
      return ActionType.NONE;
    if (index < 0 && index > -100) return ActionType.OLD_ACTIVE;
    if (effectiveStatus === "disputed") return ActionType.DISPUTED;
    if (effectiveStatus === "vouching") {
      if (effectiveFunded < arbitrationCost + BigInt(contractData.baseDeposit))
        return ActionType.FUND;
      if (effectiveValidVouches >= contractData.requiredNumberOfVouches)
        return ActionType.ADVANCE;
      if (
        effectiveOnChainVouches.length + effectiveOffChainVouches.length >= 0 &&
        didIVouchFor &&
        isVouchOnchain
      )
        return ActionType.REMOVE_VOUCH;
      return ActionType.VOUCH;
    }
    if (effectiveStatus == "resolving")
      return +lastStatusChange + +contractData.challengePeriodDuration < Date.now() / 1000
        ? ActionType.EXECUTE
        : ActionType.CHALLENGE;
    return ActionType.NONE;
  }, [
    effectiveStatus,
    index,
    effectiveFunded,
    arbitrationCost,
    contractData.baseDeposit,
    effectiveValidVouches,
    contractData.requiredNumberOfVouches,
    effectiveOnChainVouches,
    effectiveOffChainVouches,
    didIVouchFor,
    isVouchOnchain,
    lastStatusChange,
    contractData.challengePeriodDuration,
  ]);

  const [canAdvance, setCanAdvance] = useState(true);

  const [prepareExecute, execute, executeStatus] = usePoHWrite(
    "executeRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess(ctx) {
          applyOptimisticWriteSuccess(ctx, {
            request: {
              state: requestOptimistic.effective,
              applyPatch: requestOptimistic.applyPatch,
              address,
            },
          });
          toast.success("Request executed successfully");
          setTimeout(() => router.refresh(), 1000);
        },
      }),
      [router, requestOptimistic, address],
    ),
  );
  const [prepareAdvance, advanceFire, advanceStatus] = usePoHWrite(
    "advanceState",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess(ctx) {
          applyOptimisticWriteSuccess(ctx, {
            request: {
              state: requestOptimistic.effective,
              applyPatch: requestOptimistic.applyPatch,
              address,
            },
          });
          toast.success("Request advanced to resolving state");
          setTimeout(() => router.refresh(), 1000);
        },
      }),
      [router, requestOptimistic, address],
    ),
  );
  const [prepareWithdraw, withdraw, withdrawStatus] = usePoHWrite(
    "withdrawRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onSuccess(ctx) {
          applyOptimisticWriteSuccess(ctx, {
            request: {
              state: requestOptimistic.effective,
              applyPatch: requestOptimistic.applyPatch,
              address,
            },
          });
          toast.success("Request withdrawn successfully");
          setTimeout(() => router.refresh(), 1000);
        },
      }),
      [router, requestOptimistic, address],
    ),
  );

  const isAdvanceLoading =
    advanceStatus.write === "pending" ||
    (advanceStatus.write === "success" && advanceStatus.transaction === "pending");
  const isExecuteLoading =
    executeStatus.write === "pending" ||
    (executeStatus.write === "success" && executeStatus.transaction === "pending");
  const isWithdrawLoading =
    withdrawStatus.write === "pending" ||
    (withdrawStatus.write === "success" && withdrawStatus.transaction === "pending");

  const isAdvancePrepareError = advanceStatus.prepare === "error";
  const isExecutePrepareError = executeStatus.prepare === "error";
  const isWithdrawPrepareError = withdrawStatus.prepare === "error";
  useEffect(() => {
    if (!address || userChainId !== chain.id) return;
    if (action === ActionType.ADVANCE && !revocation) {
      prepareAdvance({
        args: [
          requester,
          effectiveOnChainVouches,
          effectiveOffChainVouches.map((v) => {
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
    if (action === ActionType.EXECUTE) {
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
    effectiveOnChainVouches,
    effectiveOffChainVouches,
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

  const statusColor = getStatusColor(effectiveRequestStatus);

  return (
    <div className="paper border-stroke bg-whiteBackground text-primaryText flex flex-col items-center justify-between gap-[12px] px-[24px] py-[24px] md:flex-row lg:gap-[20px]">
      <div className="flex items-center">
        <span className="mr-4">Status</span>
        <span
          className={`rounded-full px-3 py-1 text-white bg-status-${statusColor} whitespace-nowrap`}
        >
          {getStatusLabel(effectiveRequestStatus, 'actionBar')}
        </span>
      </div>
      <div className="flex w-full flex-col justify-between gap-[12px] font-normal md:flex-row md:items-center">
        {web3Loaded &&
          (action === ActionType.REMOVE_VOUCH ||
            action === ActionType.VOUCH ||
            action === ActionType.FUND) && (
            <>
              <div className="flex justify-center gap-6 md:justify-start">
                <span className="text-center text-slate-400 md:text-left">
                  {effectiveValidVouches < contractData.requiredNumberOfVouches && (
                    <>
                      It needs{" "}
                      <strong className={`text-status-${statusColor}`}>
                        {contractData.requiredNumberOfVouches}
                      </strong>{" "}
                      {+contractData.requiredNumberOfVouches === 1
                        ? "vouch"
                        : "vouches"}{" "}
                      to proceed
                    </>
                  )}
                  {!!(totalCost - effectiveFunded) && (
                    <>
                      {effectiveValidVouches < contractData.requiredNumberOfVouches
                        ? " + "
                        : "It needs "}
                      <strong className={`text-status-${statusColor}`}>
                        {formatEther(totalCost - effectiveFunded)}{" "}
                        {chain.nativeCurrency.symbol}
                      </strong>{" "}
                      to complete the initial deposit
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-center gap-4 md:justify-start">
                {requester.toLocaleLowerCase() === address?.toLowerCase() ? (
                  <div className="flex flex-col items-center md:items-start">
                    <div className="flex flex-row justify-center gap-2 md:justify-start">
                      {action === ActionType.FUND && (
                        <FundButton
                          pohId={pohId}
                          totalCost={
                            BigInt(contractData.baseDeposit) + arbitrationCost
                          }
                          index={index}
                          funded={effectiveFunded}
                        />
                      )}
                      <ActionButton
                        disabled={isWithdrawPrepareError || userChainId !== chain.id}
                        isLoading={isWithdrawLoading}
                        onClick={withdraw}
                        variant="secondary"
                        label={isWithdrawLoading ? "Withdrawing" : "Withdraw"}
                        tooltip={
                          isWithdrawPrepareError
                            ? "Withdraw not possible, please try again"
                            : userChainId !== chain.id
                              ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}`
                              : undefined
                        }
                        className="mb-2 w-auto"
                      />
                    </div>
                    {effectiveValidVouches < contractData.requiredNumberOfVouches && (
                      <ExternalLink
                        href="https://t.me/proofhumanity"
                        className="text-purple hover:opacity-80 underline underline-offset-4 text-sm font-medium inline-flex items-center gap-1 group transition-colors justify-center md:justify-end"
                      >
                        Get a vouch
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-external-link h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          <path d="M15 3h6v6"></path>
                          <path d="M10 14 21 3"></path>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        </svg>
                      </ExternalLink>
                    )}
                  </div>
                ) : !didIVouchFor ? (
                  <>
                    {action === ActionType.FUND && (
                      <FundButton
                        pohId={pohId}
                        totalCost={
                          BigInt(contractData.baseDeposit) + arbitrationCost
                        }
                        index={index}
                        funded={effectiveFunded}
                      />
                    )}
                    <Vouch
                      pohId={pohId}
                      claimer={requester}
                      web3Loaded={web3Loaded}
                      me={me}
                      chain={chain}
                      address={address}
                    />
                  </>
                ) : (
                  <>
                    {action === ActionType.FUND && (
                      <FundButton
                        pohId={pohId}
                        totalCost={
                          BigInt(contractData.baseDeposit) + arbitrationCost
                        }
                        index={index}
                        funded={effectiveFunded}
                      />
                    )}
                    <RemoveVouch
                      requester={requester}
                      pohId={pohId}
                      web3Loaded={web3Loaded}
                      chain={chain}
                      userChainId={userChainId}
                      disabled={!isVouchOnchain}
                      tooltip={
                        !isVouchOnchain
                          ? "Off chain vouches cannot be removed"
                          : undefined
                      }
                    />
                  </>
                )}
              </div>
            </>
          )}

        {web3Loaded && action === ActionType.ADVANCE && (
          <>
            <span className="text-center text-slate-400 md:text-left">
              Ready to advance
            </span>

            <div className="flex justify-center gap-4 md:justify-start">
              {requester.toLocaleLowerCase() === address?.toLowerCase() ? (
                <ActionButton
                  disabled={isWithdrawPrepareError || userChainId !== chain.id}
                  isLoading={isWithdrawLoading}
                  onClick={withdraw}
                  variant="secondary"
                  label={"Withdraw"}
                  tooltip={isWithdrawPrepareError ? "Withdraw not possible, please try again" : userChainId !== chain.id ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}` : undefined}
                  className="mb-2 w-auto"
                />
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
                tooltip={isAdvancePrepareError ? "Advance not possible, please try again" : userChainId !== chain.id ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}` : undefined}
                className="mb-2 w-auto"
              />
            </div>
          </>
        )}
        {action === ActionType.EXECUTE && (
          <>
            <span className="text-center text-slate-400 md:text-left">
              Ready to finalize.
            </span>
            <div className="flex flex-col items-center justify-between gap-4 font-normal md:flex-row md:items-center">
              <ActionButton
                disabled={isExecutePrepareError || userChainId !== chain.id}
                isLoading={isExecuteLoading}
                onClick={execute}
                label={isExecuteLoading ? "Executing" : "Execute"}
                tooltip={isExecutePrepareError ? "Execute not possible, please try again" : userChainId !== chain.id ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}` : undefined}
                className="mb-2 w-auto"
              />
            </div>
          </>
        )}

        {action === ActionType.CHALLENGE && (
          <>
            <div className="text-center text-slate-400 md:text-left">
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
            <span className="text-center text-slate-400 md:text-left">
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

            <div className="flex flex-wrap justify-center gap-4 lg:flex-nowrap lg:justify-start">
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
                requestStatus={effectiveRequestStatus}
              />

              <ExternalLink
                href={`https://klerosboard.com/${chain.id}/cases/${currentChallenge.disputeId}`}
                className="btn-main gradient h-[48px] rounded w-auto items-center justify-center p-2 whitespace-nowrap"
              >
                View case #{currentChallenge.disputeId}
              </ExternalLink>
            </div>
          </>
        )}
        {action === ActionType.DISPUTED && !currentChallenge && pendingChallenge && (
          <span className="text-center text-slate-400 md:text-left">
            Challenge submitted. Waiting for dispute details to sync.
          </span>
        )}

        {effectiveStatus === "resolved" && (
          <span className="text-center md:text-left">
            {effectiveRequestStatus === RequestStatus.EXPIRED ?
              "Request has expired" :
              effectiveRequestStatus === RequestStatus.REJECTED ?
                "Request was rejected" : "Request was accepted"}
            <TimeAgo
              className={`ml-1 text-status-${statusColor}`}
              time={effectiveRequestStatus === RequestStatus.EXPIRED
                ? humanityExpirationTime!
                : lastStatusChange}
            />
            .
          </span>
        )}

        {index < 0 && index > -100 && (
          <span className="text-center md:text-left">
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
