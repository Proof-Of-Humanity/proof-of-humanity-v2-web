"use client";

import { useQuery } from "@tanstack/react-query";
import ExternalLink from "components/ExternalLink";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import InfoTooltip from "components/InfoTooltip";
import CurrencyField from "components/CurrencyField";
import Progress from "components/Progress";
import TimeAgo from "components/TimeAgo";
import ActionButton from "components/ActionButton";
import RequestModal, {
  RequestModalActions,
  RequestModalHeader,
} from "components/RequestModal";
import { SupportedChainId, explorerTxLink, idToChain } from "config/chains";
import {
  APIArbitrator,
  DisputeStatusEnum,
  SideEnum,
} from "contracts/apis/APIArbitrator";
import { APIPoH, StakeMultipliers } from "contracts/apis/APIPoH";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { RequestQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import useFundingAmount from "hooks/useFundingAmount";
import { resolveTxState } from "utils/txState";
import { useRequestOptimistic } from "optimistic/request";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { formatEth } from "utils/misc";
import { shortenAddress } from "utils/address";
import { Address, Hash } from "viem";
import { useRouter } from "next/navigation";

type AppealChallenge = ArrayElement<
  NonNullable<NonNullable<RequestQuery>["request"]>["challenges"]
>;

const toBigIntOrZero = (amount: bigint | string | number | null | undefined) =>
  BigInt(amount ?? 0);

// Stake multipliers are expressed in basis points on the PoH contract.
const MULTIPLIER_DIVISOR = 10_000n;

// Total amount a side must raise: the raw appeal cost plus that side's stake.
// The stake depends on whether the side is currently winning or losing; on a
// shared ruling ("neither side") both sides pay the shared stake.
const getSideAppealCosts = (
  appealCost: bigint,
  currentRulingSide: SideEnum,
  {
    winnerStakeMultiplier,
    loserStakeMultiplier,
    sharedStakeMultiplier,
  }: StakeMultipliers,
) => {
  const withStake = (multiplier: bigint | undefined) =>
    appealCost + (appealCost * toBigIntOrZero(multiplier)) / MULTIPLIER_DIVISOR;

  if (currentRulingSide === SideEnum.shared) {
    const sharedCost = withStake(sharedStakeMultiplier);
    return { claimerCost: sharedCost, challengerCost: sharedCost };
  }

  const winnerCost = withStake(winnerStakeMultiplier);
  const loserCost = withStake(loserStakeMultiplier);
  return currentRulingSide === SideEnum.claimer
    ? { claimerCost: winnerCost, challengerCost: loserCost }
    : { claimerCost: loserCost, challengerCost: winnerCost };
};

// The subgraph appends a new round as soon as appeal funding starts, while
// nbRounds only counts completed rounds — an extra entry in `rounds` therefore
// means the last round is the in-progress (partially funded) appeal round.
const getPendingAppealRoundFunds = (challenge: AppealChallenge) => {
  const hasInProgressAppealRound =
    Number(challenge.nbRounds) + 1 === challenge.rounds.length;
  if (!hasInProgressAppealRound)
    return { claimerFunds: 0n, challengerFunds: 0n };

  const currentRound = challenge.rounds.at(-1); //latest round
  return {
    claimerFunds: toBigIntOrZero(currentRound?.requesterFund?.amount),
    challengerFunds: toBigIntOrZero(currentRound?.challengerFund?.amount),
  };
};

interface SideFundingProps {
  side: SideEnum;
  arbitrator: Address;
  disputeId: bigint;
  /** The party being crowdfunded (submitter or challenger). */
  partyAddress: Address;
  partyFunds: bigint;
  appealCost: bigint;
  chainId: SupportedChainId;
  losingSideDeadlinePassed: boolean;
  onSuccess?: (txHash?: Hash) => void;
  onLoadingChange?: (loading: boolean) => void;
  isReconciling?: boolean;
  fundingPending?: boolean;
}

const SideFunding: React.FC<SideFundingProps> = ({
  side,
  disputeId,
  arbitrator,
  partyAddress,
  partyFunds,
  appealCost,
  chainId,
  losingSideDeadlinePassed,
  onSuccess,
  onLoadingChange,
  isReconciling = false,
  fundingPending = false,
}) => {
  const title = side === SideEnum.claimer ? "Submitter" : "Challenger";
  const shrunkAddress = shortenAddress(partyAddress);
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const errorToastShownRef = useRef(false);

  const appealCostEth = formatEth(appealCost);
  const fundedPercent =
    appealCostEth > 0 ? (formatEth(partyFunds) * 100) / appealCostEth : 0;
  const progressPercent = fundedPercent > 100 ? 100 : fundedPercent;
  const isFullyFunded = appealCost > 0n && partyFunds >= appealCost;
  const {
    input: fundInput,
    setInput: setFundInput,
    inputAmount,
    remainingAmount,
    unit,
    disabled: isDisabled,
    tooltip: submitTooltip,
  } = useFundingAmount({
    chainId,
    funded: partyFunds,
    totalCost: appealCost,
    defaultToRemaining: true,
    checks: [
      { active: isFullyFunded, message: "Already funded" },
      { active: isReconciling, message: "Waiting for indexer" },
      {
        active: fundingPending,
        message: "Another funding transaction is pending",
      },
      {
        active: losingSideDeadlinePassed,
        message: "Appeal time has ended for this side",
      },
    ],
  });
  const [prepareFundAppeal] = usePoHWrite(
    "fundAppeal",
    useMemo(
      () => ({
        onReady(fire) {
          fire();
        },
        onError() {
          loading.stop();
          onLoadingChange?.(false);
          toast.error("Transaction rejected");
        },
        onSuccess(ctx) {
          loading.stop();
          onLoadingChange?.(false);
          toast.success("Funded appeal successfully");
          onSuccess?.(ctx.txHash);
        },
        onFail() {
          loading.stop();
          onLoadingChange?.(false);
          // Only surface the failure toast once per mount.
          !errorToastShownRef.current &&
            toast.info(
              "Transaction is not possible! Do you have enough funds?",
            );
          errorToastShownRef.current = true;
        },
      }),
      [loading, onLoadingChange, onSuccess],
    ),
  );

  return (
    <div className="border-stroke bg-whiteBackground w-full min-w-0 rounded-card border p-4">
      <div className="mb-4 flex flex-col gap-3">
        <span className="text-base font-semibold">{title}</span>
        <span className="text-secondaryText text-sm font-normal">
          {shrunkAddress}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <CurrencyField
          symbol={unit}
          step="any"
          min={0}
          max={formatEth(remainingAmount)}
          value={fundInput}
          onChange={(v) => setFundInput(v.target.value)}
          disabled={isLoading || isFullyFunded}
        />
        <ActionButton
          onClick={async () => {
            if (inputAmount === null || inputAmount === 0n) return;
            loading.start("Funding...");
            onLoadingChange?.(true);
            prepareFundAppeal({
              args: [arbitrator, BigInt(disputeId), side],
              value: inputAmount,
            });
          }}
          label={loadingMessage || "Fund"}
          className="w-full px-5"
          fullWidth
          disabled={isDisabled}
          isLoading={isLoading}
          tooltip={submitTooltip}
        />
      </div>
      <Progress
        value={progressPercent}
        label={`${formatEth(partyFunds)} ${unit} out of ${formatEth(appealCost)} ${unit} required`}
      />
    </div>
  );
};

interface AppealProps {
  arbitrator: Address;
  extraData: any;
  claimer: Address;
  challenger: Address;
  disputeId: bigint;
  chainId: SupportedChainId;
  currentChallenge: AppealChallenge;
  disabled?: boolean;
  tooltip?: string;
  onAppealableChange?: (appealable: boolean) => void;
}

// Everything read from the arbitrator/PoH contracts. Fetched once on mount —
// this is a snapshot, not live data.
interface AppealSnapshot {
  status: DisputeStatusEnum;
  /** End of the appeal period, in unix seconds. */
  appealPeriodEnd: number;
  currentRulingSide: SideEnum;
  /**
   * The contract only lets the currently losing side fund during the first
   * half of the appeal period; true once that midpoint has passed.
   */
  losingSideDeadlinePassed: boolean;
  claimerCost: bigint;
  challengerCost: bigint;
}

const Appeal: React.FC<AppealProps> = ({
  disputeId,
  arbitrator,
  extraData,
  chainId,
  claimer,
  challenger,
  currentChallenge,
  disabled: externalDisabled,
  tooltip: externalTooltip,
  onAppealableChange,
}) => {
  const { pendingAction } = useRequestOptimistic();
  const isReconciling = pendingAction !== null;
  const router = useRouter();

  const [isAppealModalOpen, setAppealModalOpen] = useState(false);
  const [appealFundingPending, setAppealFundingPending] = useState(false);
  const [fundSuccess, setFundSuccess] = useState<{ txHash?: Hash } | null>(
    null,
  );

  // Funds already committed to the pending appeal round, from the subgraph.
  const { claimerFunds, challengerFunds } = useMemo(
    () => getPendingAppealRoundFunds(currentChallenge),
    [currentChallenge],
  );

  const handleFundSuccess = (txHash?: Hash) => {
    setFundSuccess({ txHash });
    router.refresh();
  };

  const closeAppealModal = () => {
    setAppealModalOpen(false);
    setFundSuccess(null);
  };

  // bigint is not JSON-serializable, so the dispute id goes in as a string.
  const { data: snapshot, isError: loadFailed } = useQuery({
    queryKey: ["appealSnapshot", chainId, arbitrator, disputeId.toString()],
    queryFn: async (): Promise<AppealSnapshot> => {
      const stakeMultipliers = await APIPoH.getStakeMultipliers(chainId);
      const { status, cost, period, currentRuling } =
        await APIArbitrator.getArbitratorsData(
          chainId,
          arbitrator,
          disputeId,
          extraData,
        );

      const currentRulingSide = Number(currentRuling) as SideEnum;
      const periodStart = Number(period![0]);
      const periodEnd = Number(period![1]);
      const losingSideDeadline = (periodStart + periodEnd) / 2;

      return {
        status: Number(status) as DisputeStatusEnum,
        appealPeriodEnd: periodEnd,
        currentRulingSide,
        losingSideDeadlinePassed: losingSideDeadline < Date.now() / 1000,
        ...getSideAppealCosts(cost!, currentRulingSide, stakeMultipliers),
      };
    },
  });

  // Surface the load failure once.
  useEffect(() => {
    if (loadFailed)
      toast.info(
        "Unexpected error while reading appellate round info. Come back later",
      );
  }, [loadFailed]);

  const appealTrigger = resolveTxState([
    { active: !!externalDisabled, message: externalTooltip ?? "Disabled" },
    { active: isReconciling, message: "Waiting for indexer" },
  ]);

  const isAppealable =
    !loadFailed && snapshot?.status === DisputeStatusEnum.Appealable;

  useEffect(() => {
    onAppealableChange?.(isAppealable);
  }, [isAppealable, onAppealableChange]);

  if (!isAppealable || !snapshot) return null;

  const { currentRulingSide, losingSideDeadlinePassed } = snapshot;
  const rulingParty =
    currentRulingSide === SideEnum.challenger
      ? "Challenger"
      : currentRulingSide === SideEnum.claimer
        ? "Submitter"
        : "neither side";

  return (
    <>
      <InfoTooltip
        align="right"
        label={
          <>
            Appeal ends&nbsp;
            <TimeAgo time={snapshot.appealPeriodEnd} />
          </>
        }
      >
        <p>
          When someone challenges a profile, a case is opened in Kleros Court.
        </p>
        <p>
          A group of random jurors is selected to review the case. They look at
          the evidence from both sides and vote. The side with the most votes
          wins the dispute.
        </p>
        <p>
          If either side disagrees with the decision, they can appeal. The case
          is reviewed again by a new group of jurors.
        </p>
        <p>
          Providing clear evidence is important. It helps the jurors understand
          the case and make a fair decision.
        </p>
      </InfoTooltip>
      <ActionButton
        onClick={() => setAppealModalOpen(true)}
        disabled={appealTrigger.disabled}
        tooltip={appealTrigger.tooltip}
        label="Appeal"
        variant="secondary"
        className="w-[170px]"
      />
      <RequestModal
        open={isAppealModalOpen}
        onClose={closeAppealModal}
        canClose={!appealFundingPending}
      >
        {fundSuccess ? (
          <>
            <RequestModalHeader
              title={
                <>
                  Thanks for helping{" "}
                  <span className="text-peach">fund the appeal</span>!
                </>
              }
              description="Your appeal-funding transaction was confirmed."
            />
            {fundSuccess.txHash && idToChain(chainId) && (
              <div className="mt-4 flex justify-center">
                <ExternalLink
                  className="group/external-link inline-flex items-center gap-2 text-sm text-peach hover:opacity-80"
                  href={explorerTxLink(fundSuccess.txHash, idToChain(chainId)!)}
                >
                  View the transaction
                  <ExternalLinkIcon />
                </ExternalLink>
              </div>
            )}
            <RequestModalActions onReturn={closeAppealModal} />
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-base font-semibold">Case #{disputeId}</span>
              <h1 className="text-2xl font-semibold">
                Appeal <span className="text-peach">the Decision</span>
              </h1>
              <p className="text-secondaryText text-sm font-normal">
                The jury decided in favor of {rulingParty}.
              </p>
              <ExternalLink
                className="group/external-link inline-flex items-center gap-2 text-sm font-normal text-peach hover:opacity-80"
                href={`https://klerosboard.com/${chainId}/cases/${currentChallenge.disputeId}`}
              >
                Check how the jury voted
                <ExternalLinkIcon />
              </ExternalLink>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <p className="text-secondaryText max-w-2xl text-sm font-normal leading-5">
                Each side has its own crowdfunding target. A new appeal is
                created only after both the submitter and challenger sides are
                fully funded. If only one side reaches its target before the
                deadline, the final ruling is set in favor of that funded side.
              </p>
              <div className="text-secondaryText flex items-start gap-2 text-left text-xs font-normal">
                <span className="text-status-claim" aria-hidden>
                  ⓘ
                </span>
                <span>
                  External contributors can also crowdfund the appeal.
                </span>
              </div>
            </div>
            {/* The half-period funding cutoff only applies to whichever side
                the jury ruled against; on a shared ruling neither side is
                losing, so both get the full period. */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <SideFunding
                side={SideEnum.claimer}
                disputeId={disputeId}
                arbitrator={arbitrator}
                partyAddress={claimer}
                partyFunds={claimerFunds}
                appealCost={snapshot.claimerCost}
                chainId={chainId}
                losingSideDeadlinePassed={
                  currentRulingSide === SideEnum.challenger
                    ? losingSideDeadlinePassed
                    : false
                }
                onSuccess={handleFundSuccess}
                onLoadingChange={setAppealFundingPending}
                isReconciling={isReconciling}
                fundingPending={appealFundingPending}
              />
              <SideFunding
                side={SideEnum.challenger}
                disputeId={disputeId}
                arbitrator={arbitrator}
                partyAddress={challenger}
                partyFunds={challengerFunds}
                appealCost={snapshot.challengerCost}
                chainId={chainId}
                losingSideDeadlinePassed={
                  currentRulingSide === SideEnum.claimer
                    ? losingSideDeadlinePassed
                    : false
                }
                onSuccess={handleFundSuccess}
                onLoadingChange={setAppealFundingPending}
                isReconciling={isReconciling}
                fundingPending={appealFundingPending}
              />
            </div>
            <RequestModalActions
              onReturn={closeAppealModal}
              returnDisabled={appealFundingPending}
            />
          </>
        )}
      </RequestModal>
    </>
  );
};

export default Appeal;
