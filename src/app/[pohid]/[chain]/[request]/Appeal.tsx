"use client";

import { useEffectOnce } from "@legendapp/state/react";
import Arrow from "components/Arrow";
import BulletedNumber from "components/BulletedNumber";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import Identicon from "components/Identicon";
import Modal from "components/Modal";
import Progress from "components/Progress";
import TimeAgo from "components/TimeAgo";
import ActionButton from "components/ActionButton";
import { SupportedChainId, idToChain } from "config/chains";
import {
  APIArbitrator,
  ArbitratorsData,
  DisputeStatusEnum,
  SideEnum,
} from "contracts/apis/APIArbitrator";
import { APIPoH, StakeMultipliers } from "contracts/apis/APIPoH";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { RequestQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import Image from "next/image";
import { useRequestOptimistic } from "optimistic/request";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { RequestStatus } from "utils/status";
import { formatEth } from "utils/misc";
import { Address, parseEther } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useRouter } from "next/navigation";

const toWeiBigInt = (amount: bigint | string | number | null | undefined) =>
  BigInt(amount ?? 0);

interface SideFundingProps {
  side: SideEnum;
  arbitrator: Address;
  disputeId: bigint;
  requester: Address;
  requesterFunds: bigint;
  appealCost: bigint;
  chainId: SupportedChainId;
  loosingSideHasEnd: boolean;
  onSuccess?: () => void;
  disabled?: boolean;
}

const SideFunding: React.FC<SideFundingProps> = ({
  side,
  disputeId,
  arbitrator,
  requester,
  requesterFunds,
  appealCost,
  chainId,
  loosingSideHasEnd,
  onSuccess,
  disabled = false,
}) => {
  const userChainId = useChainId();
  const { isConnected, address } = useAccount();
  const { data: balanceData } = useBalance({ address, chainId: userChainId });
  const title = side === SideEnum.claimer ? "Claimer" : "Challenger";
  const shrunkAddress: string =
    requester.substring(0, 6) + " ... " + requester.slice(-4);
  const [requesterInput, setRequesterInput] = useState("");
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const errorRef = useRef(false);

  const value = (formatEth(requesterFunds) * 100) / formatEth(appealCost);
  const valueProgress = value > 100 ? 100 : value;
  const unit = idToChain(chainId)?.nativeCurrency.symbol;

  const remainingAmount =
    appealCost > requesterFunds ? appealCost - requesterFunds : 0n;
  const inputAmount = useMemo(() => {
    if (!requesterInput) return 0n;
    try {
      const parsed = parseEther(requesterInput);
      return parsed < 0n ? 0n : parsed;
    } catch {
      return null;
    }
  }, [requesterInput]);

  const isInvalidInput = inputAmount === null;
  const isZeroInput = inputAmount === 0n;
  const insufficientFunds =
    !isInvalidInput &&
    balanceData !== undefined &&
    inputAmount! > balanceData.value;
  const exceedsRemaining = !isInvalidInput && inputAmount! > remainingAmount;

  const isDisabled =
    disabled ||
    errorRef.current ||
    loosingSideHasEnd ||
    userChainId !== chainId ||
    !isConnected ||
    !requesterInput ||
    isInvalidInput ||
    isZeroInput ||
    isLoading ||
    exceedsRemaining ||
    insufficientFunds;

  const getTooltipMessage = () => {
    if (disabled) return "Syncing";
    if (loosingSideHasEnd) return "Appeal time has ended for this side";
    if (!isConnected) return "Please connect your wallet";
    if (userChainId !== chainId)
      return `Switch your chain above to ${idToChain(chainId)?.name || "the correct chain"}`;
    if (!requesterInput) return "Please enter an amount to fund";
    if (isInvalidInput) return "Please enter a valid amount";
    if (isZeroInput) return "Amount must be greater than 0";
    if (exceedsRemaining)
      return `Amount exceeds remaining needed (${formatEth(remainingAmount)} ${unit})`;
    if (insufficientFunds)
      return `Insufficient balance. You have ${formatEth(balanceData?.value ?? 0n)} ${unit}`;
    return undefined;
  };

  const [prepareFundAppeal] = usePoHWrite(
    "fundAppeal",
    useMemo(
      () => ({
        onReady(fire) {
          fire();
        },
        onError() {
          loading.stop();
          toast.error("Transaction rejected");
        },
        onSuccess() {
          loading.stop();
          toast.success("Funded appeal successfully");
          onSuccess?.();
        },
        onFail() {
          loading.stop();
          !errorRef.current &&
            toast.info(
              "Transaction is not possible! Do you have enough funds?",
            );
          errorRef.current = true;
        },
      }),
      [loading],
    ),
  );

  return (
    <div className="w-full min-w-0 border p-4">
      <div className="mb-2 flex gap-2">
        <Identicon diameter={32} address={requester} />
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="text-sm">{shrunkAddress}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-1">
        <Field
          type="number"
          className="no-spinner"
          step="any"
          min={0}
          max={formatEth(remainingAmount)}
          value={requesterInput}
          onChange={(v) => setRequesterInput(v.target.value)}
          disabled={isLoading}
        />
        <ActionButton
          onClick={async () => {
            if (inputAmount === null || inputAmount === 0n) return;
            loading.start("Funding...");
            prepareFundAppeal({
              args: [arbitrator as Address, BigInt(disputeId), side],
              value: inputAmount,
            });
          }}
          label={loadingMessage || "Fund"}
          className="sm:w-auto"
          disabled={isDisabled}
          isLoading={isLoading}
          tooltip={getTooltipMessage()}
        />
      </div>
      <Progress
        value={valueProgress}
        label={`${formatEth(requesterFunds)} ${unit} out of ${formatEth(appealCost)} ${unit}`}
      />
    </div>
  );
};

interface AppealProps {
  pohId: Address;
  requestIndex: number;
  arbitrator: Address;
  extraData: any;
  claimer: Address;
  challenger: Address;
  disputeId: bigint;
  chainId: SupportedChainId;
  currentChallenge: ArrayElement<
    NonNullable<NonNullable<RequestQuery>["request"]>["challenges"]
  >;
  revocation: boolean;
  requestStatus: RequestStatus;
  disabled?: boolean;
  tooltip?: string;
}

const Appeal: React.FC<AppealProps> = ({
  pohId,
  requestIndex,
  disputeId,
  arbitrator,
  extraData,
  chainId,
  claimer,
  challenger,
  currentChallenge,
  revocation,
  requestStatus,
  disabled: externalDisabled,
  tooltip: externalTooltip,
}) => {
  const { pendingAction } = useRequestOptimistic();
  const isReconciling = pendingAction !== null;
  const [totalClaimerCost, setTotalClaimerCost] = useState(0n);
  const [totalChallengerCost, setTotalChallengerCost] = useState(0n);
  const [formatedCurrentRuling, setFormatedCurrentRuling] = useState("");
  const defaultPeriod = [0n, 0n];
  const [period, setPeriod] = useState(defaultPeriod);
  const [loosingSideHasEnd, setLoosingSideHasEnd] = useState(false);
  const [loosingSideDeadline, setLoosingSideDeadline] = useState(0);
  const [currentRulingFormatted, setCurrentRulingFormatted] = useState(0);

  const [disputeStatus, setDisputeStatus] = useState(
    DisputeStatusEnum.Appealable,
  );
  const [error, setError] = useState(false);
  const errorRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [claimerFunds, setClaimerFunds] = useState(0n);
  const [challengerFunds, setChallengerFunds] = useState(0n);
  const router = useRouter();
  const [isAppealModalOpen, setAppealModalOpen] = useState(false);

  const handleFundSuccess = () => {
    setAppealModalOpen(false);
    router.refresh();
  };

  useEffectOnce(() => {
    const formatCurrentRuling = (currentRuling: SideEnum) => {
      var text = "Undecided";
      switch (currentRuling) {
        case SideEnum.claimer:
          text = "Claimer wins";
          break;
        case SideEnum.challenger:
          text = "Challenger wins";
          break;
        case SideEnum.shared:
          text = "Shared";
      }
      setFormatedCurrentRuling(text);
    };

    const calculateTotalCost = (
      appealCost: bigint,
      currentRuling: SideEnum,
      winnerMult: number,
      loserMult: number,
      sharedMult: number,
    ) => {
      const getSideTotalCost = (sideMultiplier: number) => {
        return (
          Number(appealCost) +
          (Number(appealCost) * sideMultiplier) / MULTIPLIER_DIVISOR
        );
      };
      const MULTIPLIER_DIVISOR = 10000;

      const claimerMultiplier =
        currentRuling === SideEnum.shared
          ? sharedMult
          : currentRuling === SideEnum.claimer
            ? winnerMult
            : loserMult;
      const totalClaimerCost = getSideTotalCost(Number(claimerMultiplier));
      setTotalClaimerCost(BigInt(totalClaimerCost));

      const challengerMultiplier =
        currentRuling === SideEnum.shared
          ? sharedMult
          : currentRuling === SideEnum.claimer
            ? loserMult
            : winnerMult;
      const totalChallengerCost = getSideTotalCost(
        Number(challengerMultiplier),
      );
      setTotalChallengerCost(BigInt(totalChallengerCost));
    };

    const getAppealData = async () => {
      try {
        const isPartiallyFunded =
          Number(currentChallenge.nbRounds) + 1 ===
          currentChallenge.rounds.length;
        const claimerFunds = isPartiallyFunded
          ? toWeiBigInt(currentChallenge.rounds.at(-1)?.requesterFund.amount)
          : 0n;
        const challengerFunds = isPartiallyFunded
          ? currentChallenge.rounds.at(-1)?.challengerFund
            ? toWeiBigInt(
                currentChallenge.rounds.at(-1)?.challengerFund?.amount,
              )
            : 0n
          : 0n;
        setClaimerFunds(claimerFunds);
        setChallengerFunds(challengerFunds);

        const stakeMultipliers: StakeMultipliers =
          await APIPoH.getStakeMultipliers(chainId);
        const winnerMult = stakeMultipliers.winnerStakeMultiplier;
        const loserMult = stakeMultipliers.loserStakeMultiplier;
        const sharedMult = stakeMultipliers.sharedStakeMultiplier;

        const arbitratorsData: ArbitratorsData =
          await APIArbitrator.getArbitratorsData(
            chainId,
            arbitrator,
            disputeId,
            extraData,
          );
        const status = arbitratorsData.status;
        const cost = arbitratorsData.cost;
        const period = arbitratorsData.period;
        const currentRuling = arbitratorsData.currentRuling;

        setPeriod(period!);
        const loosingSideDeadline =
          (parseInt(String(period![0])) + parseInt(String(period![1]))) / 2;

        setLoosingSideHasEnd(loosingSideDeadline < Date.now() / 1000);
        setLoosingSideDeadline(loosingSideDeadline);
        setDisputeStatus(Number(status) as DisputeStatusEnum);
        const currentRulingFormatted = Number(currentRuling) as SideEnum;
        setCurrentRulingFormatted(currentRulingFormatted);
        formatCurrentRuling(currentRulingFormatted);
        calculateTotalCost(
          cost!,
          currentRulingFormatted,
          Number(winnerMult),
          Number(loserMult),
          Number(sharedMult),
        );

        setLoading(false);
      } catch (e) {
        !errorRef.current &&
          toast.info(
            "Unexpected error while reading appelate round info. Come back later",
          );
        setError(true);
        errorRef.current = true;
      }
    };
    getAppealData();
  });
  return disputeStatus === DisputeStatusEnum.Appealable &&
    !error &&
    !loading ? (
    <>
      <div className="group relative w-[150px] md:w-auto">
        <button
          onClick={() => setAppealModalOpen(true)}
          disabled={externalDisabled || isReconciling}
          className="btn-sec w-[150px] rounded py-2 md:w-auto"
        >
          <span className="flex-inline flex flex-wrap items-center whitespace-nowrap md:flex-nowrap">
            Appeal (ends&nbsp;
            <TimeAgo time={parseInt(String(period[1]))} />)
          </span>
        </button>
        {(externalDisabled || isReconciling) && (
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            {externalDisabled ? (externalTooltip ?? "Disabled") : "Syncing"}
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          </span>
        )}
      </div>
      <Modal
        header={`Appeal case #${disputeId}`}
        open={isAppealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        className="max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] max-w-[1020px] overflow-y-auto md:!w-[88vw] xl:!w-[1020px]"
      >
        <div className="paper w-full px-4 py-6 sm:px-8 lg:px-16 lg:py-8">
          <h1 className="mb-4 text-xl">
            Appeal the decision: {formatedCurrentRuling}
          </h1>
          <div className="gradient-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF9966] to-[#FF8CA9]"></div>
            <div className="absolute inset-0 border-2 border-solid border-transparent"></div>
            <div className="mb-1"></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-start">
              <BulletedNumber number={1} />
              {!revocation ? (
                <span className="mx-2 mt-2 text-sm">
                  The profile was challenged for{" "}
                  <strong className="text-status-challenged capitalize">
                    {currentChallenge.reason.id}
                  </strong>
                  .
                </span>
              ) : (
                <span className="mx-2 mt-2 text-sm">
                  The profile was challenged.
                </span>
              )}
            </div>
            <div className="flex items-start">
              <BulletedNumber number={2} />

              <div className="mx-2 mt-2 min-w-0 text-sm">
                <span className="inline">
                  Independent jurors evaluated the evidence, policy compliance,
                  and voted in favor of:{" "}
                  {currentRulingFormatted === SideEnum.challenger
                    ? "Challenger"
                    : currentRulingFormatted === SideEnum.claimer
                      ? "Claimer"
                      : "Shared"}
                  .{" "}
                </span>
                <ExternalLink
                  className="text-orange inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 align-baseline text-sm font-semibold leading-snug hover:text-orange-500"
                  href={`https://klerosboard.com/${chainId}/cases/${currentChallenge.disputeId}`}
                >
                  <span className="text-sm font-semibold leading-snug">
                    Check how the jury voted
                  </span>
                  <Arrow />
                </ExternalLink>
              </div>
            </div>
            <div className="flex items-start">
              <BulletedNumber number={3} current={!loosingSideHasEnd} />
              {loosingSideHasEnd ? (
                <span className="mx-2 mt-2 text-sm">
                  The losing party's appeal time ended&nbsp;
                  <TimeAgo time={loosingSideDeadline} />.
                </span>
              ) : (
                <span className="mx-2 mt-2 text-sm">
                  The losing party's appeal time ends&nbsp;
                  <TimeAgo time={loosingSideDeadline} />.
                </span>
              )}
            </div>
            <div className="flex items-start">
              <BulletedNumber number={4} current />
              <span className="mx-2 mt-2 text-sm">
                Appeal timeframe ends&nbsp;
                <TimeAgo time={parseInt(String(period[1]))} />.
              </span>
            </div>
            <div className="mb-4 mt-4">
              <span className="text-sm">
                In order to appeal the decision, you need to fully fund the
                crowdfunding deposit. The dispute will be sent to the jurors
                when the full deposit is reached. Note that if the previous
                round loser funds its side, the previous round winner should
                also fully fund its side, in order not to lose the case.
              </span>
              <div className="mt-4 flex items-center opacity-75">
                <Image
                  alt="warning"
                  src="/logo/exclamation.svg"
                  height={24}
                  width={24}
                />
                <span className="mx-2 min-w-0 text-sm opacity-75">
                  External contributors can also crowdfund the appeal.
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2">
            <SideFunding
              side={SideEnum.claimer}
              disputeId={disputeId}
              arbitrator={arbitrator!}
              requester={claimer}
              requesterFunds={claimerFunds}
              appealCost={totalClaimerCost}
              chainId={chainId}
              loosingSideHasEnd={
                currentRulingFormatted === SideEnum.challenger
                  ? loosingSideHasEnd
                  : false
              }
              onSuccess={handleFundSuccess}
              disabled={isReconciling}
            />
            <SideFunding
              side={SideEnum.challenger}
              disputeId={disputeId}
              arbitrator={arbitrator!}
              requester={challenger}
              requesterFunds={challengerFunds}
              appealCost={totalChallengerCost}
              chainId={chainId}
              loosingSideHasEnd={
                currentRulingFormatted === SideEnum.claimer
                  ? loosingSideHasEnd
                  : false
              }
              onSuccess={handleFundSuccess}
              disabled={isReconciling}
            />
          </div>
        </div>
      </Modal>
    </>
  ) : null;
};

export default Appeal;
