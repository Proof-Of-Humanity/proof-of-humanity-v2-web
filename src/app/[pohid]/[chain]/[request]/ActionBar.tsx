"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useEffectOnce } from "@legendapp/state/react";
import ExternalLink from "components/ExternalLink";
import TimeAgo from "components/TimeAgo";
import { colorForStatus } from "config/misc";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { getMyData } from "data/user";
import { RequestQuery } from "generated/graphql";
import useChainParam from "hooks/useChainParam";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { camelToTitle } from "utils/case";
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
  expired: boolean;
  arbitrationHistory: {
    __typename?: "ArbitratorHistory" | undefined;
    updateTime: any;
    registrationMeta: string;
    id: string;
    arbitrator: any;
    extraData: any;
  };
  rejected: boolean;
  humanityExpirationTime?: number;
  validVouches: number;
}

export default function ActionBar({
  pohId,
  requester,
  index,
  revocation,
  status,
  funded,
  lastStatusChange,
  arbitrationCost,
  contractData,
  currentChallenge,
  onChainVouches,
  offChainVouches,
  // advanceRequestsOnChainVouches,
  expired,
  arbitrationHistory,
  rejected,
  validVouches,
}: ActionBarProps) {
  const chain = useChainParam()!;
  const { address } = useAccount();
  const loading = useLoading();
  const [pending] = loading.use();
  const web3Loaded = useWeb3Loaded();
  const userChainId = useChainId();
  const { data: me } = useSWR(address, getMyData);

  // const [prepareMulticallAdvance, multicallAdvanceFire] = useWagmiWrite(
  //   "Multicall3",
  //   "aggregate",
  //   useMemo(
  //     () => ({
  //       onLoading() {
  //         loading.start();
  //       },
  //     }),
  //     [loading]
  //   )
  // );

  const errorRef = useRef(false);
  const offChainRef = useRef(false);
  const [action, setAction] = useState(ActionType.NONE);
  const [canAdvance, setCanAdvance] = useState(true);
  const [didIVouchFor, setDidIVouchFor] = useState(false);
  const [isVouchOnchain, setIsVouchOnchain] = useState(false);

  const handleDidIVouchFor = () => {
    return (
      onChainVouches.length + offChainVouches.length >= 0 &&
      (onChainVouches.some((voucherAddress) => {
        if (
          voucherAddress.toLocaleLowerCase() === address?.toLocaleLowerCase()
        ) {
          setIsVouchOnchain(true);
          return true;
        }
        setIsVouchOnchain(false);
        return false;
      }) ||
        offChainVouches.some((voucher) => {
          if (
            voucher.voucher.toLocaleLowerCase() === address?.toLocaleLowerCase()
          ) {
            if (!offChainRef.current && userChainId === chain.id) {
              toast.error("Off chain vouches cannot be removed");
              offChainRef.current = true;
            }
            return true;
          }
          return false;
        }))
    );
  };
  useEffect(() => {
    setDidIVouchFor(handleDidIVouchFor());
  }, [address, action, requester, revocation, chain, userChainId]);

  useEffectOnce(() => {
    const checkVouchStatus = async () => {
      if (status === "resolved" || status === "withdrawn")
        setAction(ActionType.NONE);
      else if (index < 0 && index > -100) setAction(ActionType.OLD_ACTIVE);
      else if (status === "disputed") setAction(ActionType.DISPUTED);
      else if (status === "vouching") {
        if (funded < arbitrationCost + BigInt(contractData.baseDeposit))
          setAction(ActionType.FUND);
        else if (
          validVouches >= contractData.requiredNumberOfVouches
        )
          setAction(ActionType.ADVANCE);
        else if (
          onChainVouches.length + offChainVouches.length >= 0 &&
          didIVouchFor &&
          isVouchOnchain
        )
          setAction(ActionType.REMOVE_VOUCH);
        else setAction(ActionType.VOUCH);
      } else if (status == "resolving")
        setAction(
          +lastStatusChange + +contractData.challengePeriodDuration <
            Date.now() / 1000
            ? ActionType.EXECUTE
            : ActionType.CHALLENGE,
        );
    };
    checkVouchStatus();
  });

  const [prepareExecute, execute] = usePoHWrite(
    "executeRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onLoading() {
          loading.start();
          toast.info("Transaction pending");
        },
        onSuccess() {
          toast.success("Requested executed successfully");
        },
      }),
      [loading],
    ),
  );
  const [prepareAdvance, advanceFire] = usePoHWrite(
    "advanceState",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onLoading() {
          loading.start();
          toast.info("Transaction pending");
        },
        onSuccess() {
          toast.success("Request advanced to resolving state");
        },
        onFail() {
          !errorRef.current && toast.error("Advance is not possible");
          errorRef.current = true;
          setCanAdvance(false);
        },
      }),
      [loading],
    ),
  );
  const [prepareWithdraw, withdraw] = usePoHWrite(
    "withdrawRequest",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onLoading() {
          loading.start();
          toast.info("Transaction pending");
        },
        onSuccess() {
          toast.success("Request withdrawn successfully");
        },
      }),
      [loading],
    ),
  );
  const advance = useCallback(
    () => advanceFire(),
    // || multicallAdvanceFire
    [
      advanceFire,
      //  multicallAdvanceFire
    ],
  );

  useEffect(() => {
    if (action === ActionType.ADVANCE && !revocation) {
      setCanAdvance(true);
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
    }

    if (action === ActionType.EXECUTE)
      prepareExecute({ args: [pohId, BigInt(index)] });
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
  const statusColor = colorForStatus(status, revocation, expired,rejected);

  return (
    <div className="paper border-stroke bg-whiteBackground text-primaryText flex flex-col items-center justify-between gap-[12px] px-[24px] py-[24px] md:flex-row lg:gap-[20px]">
      <div className="flex items-center">
        <span className="mr-4">Status</span>
        <span
          className={`rounded-full px-3 py-1 text-white bg-status-${statusColor}`}
        >
          {camelToTitle(status, revocation, expired,rejected)}
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

                {requester.toLocaleLowerCase() === address?.toLowerCase() ? (
                  <button
                    disabled={userChainId !== chain.id}
                    className="btn-main mb-2"
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
              <button
                disabled={pending || userChainId !== chain.id || !canAdvance}
                className="btn-main mb-2"
                onClick={advance}
              >
                Advance
              </button>
            </div>
          </>
        )}
        {action === ActionType.EXECUTE && (
          <>
            <span className="text-slate-400">Ready to finalize.</span>
            <div className="flex flex-col justify-between gap-4 font-normal md:flex-row md:items-center">
              <button
                disabled={pending || userChainId !== chain.id}
                className="btn-main mb-2"
                onClick={execute}
              >
                Execute
              </button>
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
                  <strong className="text-status-challenged">
                    {camelToTitle(
                      currentChallenge.reason.id,
                      revocation,
                      expired,
                      rejected
                    )}
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
                expired={expired}
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
          <>
            <span>
              {expired
                ? "Request has expired"
                : !rejected
                  ? "Request was accepted"
                  : "Request was rejected"}
              {!expired ? (
                <TimeAgo
                  className={`ml-1 text-status-${statusColor}`}
                  time={lastStatusChange}
                />
              ) : null}
              .
            </span>
          </>
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
