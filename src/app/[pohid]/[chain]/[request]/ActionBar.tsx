"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useEffectOnce } from "@legendapp/state/react";
import { colorForStatus } from "config/misc";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Address, Hash, formatEther, hexToSignature } from "viem";
import { useAccount, useChainId } from "wagmi";
import ExternalLink from "components/ExternalLink";
import withClientConnected from "components/HighOrder/withClientConnected";
import TimeAgo from "components/TimeAgo";
import { RequestQuery } from "generated/graphql";
import useChainParam from "hooks/useChainParam";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { camelToTitle } from "utils/case";
import { ActionType } from "utils/enums";
import Challenge from "./Challenge";
import FundButton from "./Funding";
import RemoveVouch from "./RemoveVouch";
import Vouch from "./Vouch";
import { getMyData } from "data/user";
import useSWR from "swr";
import Appeal from "./Appeal";


enableReactUse();

// const encodeClaimToAdvance = (claimer: Address, vouchers: Address[]) =>
//   encodeFunctionData<typeof abis.ProofOfHumanity, "advanceState">({
//     abi: abis.ProofOfHumanity,
//     functionName: "advanceState",
//     args: [claimer, vouchers, []],
//   });

interface ActionBarProps extends JSX.IntrinsicAttributes {
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
  arbitrationHistory: { __typename?: "ArbitratorHistory" | undefined; updateTime: any; registrationMeta: string; id: string; arbitrator: any; extraData: any; }
}

export default withClientConnected<ActionBarProps>(function ActionBar({
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
}) {
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
  const [didIVouchFor, setDidIVouchFor] = useState(false);
  const [isVouchOnchain, setIsVouchOnchain] = useState(false);

  const handleDidIVouchFor = () => {
    return (
      onChainVouches.length + offChainVouches.length >= 0 &&
      (onChainVouches.some((voucherAddress) => {
        if (voucherAddress.toLocaleLowerCase() === address?.toLocaleLowerCase()) {
          setIsVouchOnchain(true);
          return true;
        }
        setIsVouchOnchain(false);
        return false;
      }) ||
        offChainVouches.some(
          (voucher) => {
            if (voucher.voucher.toLocaleLowerCase() === address?.toLocaleLowerCase()) {
              if (!offChainRef.current && userChainId === chain.id) {
                toast.error("Off chain vouches cannot be removed");
                offChainRef.current = true;
              }
              return true;
            }
            return false;
          }
        ))
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
          onChainVouches.length + offChainVouches.length >=
          contractData.requiredNumberOfVouches
        )
          setAction(ActionType.ADVANCE);
        else if (
          (onChainVouches.length + offChainVouches.length >= 0) && 
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
            : ActionType.CHALLENGE
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
      [loading]
    )
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
          !errorRef.current && toast.error("No vouch is valid. Advance is not possible");
          errorRef.current = true;
          setAction(ActionType.VOUCH);
        },
      }),
      [loading]
    )
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
      [loading]
    )
  );
  const advance = useCallback(
    () => advanceFire(),
    // || multicallAdvanceFire
    [
      advanceFire,
      //  multicallAdvanceFire
    ]
  );

  useEffect(() => {
    //useEffectOnce(() => {
    if (action === ActionType.ADVANCE && !revocation) {
      // if (advanceRequestsOnChainVouches) {
      //   prepareMulticallAdvance({
      //     args: [
      //       [
      //         {
      //           target: Contract.ProofOfHumanity[chain.id],
      //           callData: encodeClaimToAdvance(requester, []),
      //         },
      //         ...advanceRequestsOnChainVouches!
      //           .map((vouch) => ({
      //             target: Contract.ProofOfHumanity[chain.id],
      //             callData: encodeClaimToAdvance(vouch.claimer, vouch.vouchers),
      //           }))
      //           .slice(0, 1),
      //       ],
      //     ],
      //   });
      // } else {
      // }

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
  }, [action]);

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
  }, [address, prepareWithdraw, action, requester, revocation, chain, userChainId]);

  const totalCost = BigInt(contractData.baseDeposit) + arbitrationCost;
  const statusColor = colorForStatus(status, revocation, expired);

  return (
    <div className="paper py-[24px] px-[24px] flex flex-col md:flex-row justify-between items-center gap-[12px] lg:gap-[20px] border-stroke bg-whiteBackground text-primaryText">
      <div className="flex items-center">
        <span className="mr-4">Status</span>
        <span
          className={`px-3 py-1 rounded-full text-white bg-status-${statusColor}`}
        >
          {camelToTitle(status, revocation, expired)}
        </span>
      </div>
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-[12px] font-normal">
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
                    disabled={userChainId!==chain.id}
                    className="btn-main mb-2"
                    onClick={withdraw}
                  >
                    Withdraw
                  </button>
                ) : !didIVouchFor ? (
                  <Vouch pohId={pohId} claimer={requester} web3Loaded={web3Loaded} me={me} chain={chain} address={address} />
                ) : isVouchOnchain ? (
                  <RemoveVouch requester={requester} pohId={pohId} web3Loaded={web3Loaded} chain={chain} userChainId={userChainId}/>
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
                  disabled={userChainId!==chain.id}
                  className="btn-sec mb-2"
                  onClick={withdraw}
                >
                  Withdraw
                </button>
              ) : !didIVouchFor ? (
                <Vouch pohId={pohId} claimer={requester} web3Loaded={web3Loaded} me={me} chain={chain} address={address} />
              ) : isVouchOnchain ? (
                <RemoveVouch requester={requester} pohId={pohId} web3Loaded={web3Loaded} chain={chain} userChainId={userChainId}/>
              ) : null}
              <button
                disabled={pending}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between font-normal gap-4">
              <button
                disabled={pending}
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
                      expired
                    )}
                  </strong>
                </>
              )}
              .
            </span>
            
            <div className="flex gap-4">
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
            />

            <ExternalLink
              href={`https://resolve.kleros.io/cases/${currentChallenge.disputeId}`}
              className="btn-main gradient px-[24px] h-[48px] rounded"
            >
              View case #{currentChallenge.disputeId}
            </ExternalLink>
            </div>
          </>
        )}

        {status === "resolved" && (
          <>
            <span>
              Request was accepted
              <TimeAgo
                className={`ml-1 text-status-${statusColor}`}
                time={lastStatusChange}
              />
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
});
