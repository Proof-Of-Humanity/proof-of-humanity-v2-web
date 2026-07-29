import { useState, useMemo, useCallback } from "react";
import ALink from "components/ExternalLink";
import EvidenceFormFields from "components/EvidenceFormFields";
import RequestModal, {
  RequestAmountPill,
  RequestModalHeader,
  RequestWarning,
} from "components/RequestModal";
import TimeAgo from "components/TimeAgo";
import { useLoading } from "hooks/useLoading";
import useEnoughFunds from "hooks/useEnoughFunds";
import { resolveTxState } from "utils/txState";
import useChainParam from "hooks/useChainParam";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";
import cn from "classnames";
import Image from "next/image";
import { useObservable } from "@legendapp/state/react";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import type { RequestOptimisticOverlay } from "optimistic/types";
import { Hash } from "viem";
import DocumentIcon from "icons/NoteMajor.svg";
import { ObservablePrimitiveBaseFns } from "@legendapp/state";
import { ContractData } from "data/contract";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import AuthGuard from "components/AuthGuard";
import ActionButton from "components/ActionButton";
import { CurrencyIcon } from "components/CurrencyField";
import { useChainId } from "wagmi";
import { idToChain, nativeCurrencyLabel } from "config/chains";
import { getDisputedRequestStatus } from "utils/status";
import { useRequestOptimistic } from "optimistic/request";
import { uploadEvidence } from "data/uploadEvidence";
import { getWriteErrorMessage } from "hooks/useActionFeedback";

type Reason =
  | "none"
  | "incorrectSubmission"
  | "identityTheft"
  | "sybilAttack"
  | "deceased";

const reasonToImages: Partial<Record<Reason, string[]>> = {
  incorrectSubmission: ["/reason/incorrect.png"],
  identityTheft: ["/reason/duplicate.png"],
  sybilAttack: ["/reason/dne.png"],
  deceased: ["/reason/deceased.png"],
};

const REASON_INDEX: Record<Reason, 0 | 1 | 2 | 3 | 4> = {
  none: 0,
  incorrectSubmission: 1,
  identityTheft: 2,
  sybilAttack: 3,
  deceased: 4,
};

const CHALLENGE_REASON_CARDS: {
  reason: Reason;
  label: string;
  description: string;
}[] = [
  {
    reason: "incorrectSubmission",
    label: "Incorrect Submission",
    description: "The profile does not follow the submission rules.",
  },
  {
    reason: "identityTheft",
    label: "Identity Theft",
    description:
      "The submitter is trying to claim a Humanity ID that belongs to someone else.",
  },
  {
    reason: "sybilAttack",
    label: "Sybil Attack",
    description:
      "The submitter is already registered, is a duplicate, or does not exist.",
  },
  {
    reason: "deceased",
    label: "Deceased",
    description: "The person previously existed but is no longer alive.",
  },
];

export const buildChallengeSuccessPatch = (
  revocation: boolean,
): RequestOptimisticOverlay => ({
  status: "disputed",
  requestStatus: getDisputedRequestStatus(revocation),
  lastStatusChange: Math.floor(Date.now() / 1000),
});

interface ReasonCardInterface {
  label: string;
  description: string;
  reason: Reason;
  current: ObservablePrimitiveBaseFns<Reason>;
  isUsed?: boolean;
}

const ReasonCard: React.FC<ReasonCardInterface> = ({
  label,
  description,
  reason,
  current,
  isUsed = false,
}) => {
  const isSelected = reason === current.get();
  const images = reasonToImages[reason];

  return (
    <button
      type="button"
      disabled={isUsed}
      aria-pressed={isSelected}
      className={cn(
        "text-primaryText relative flex min-h-[15.5rem] w-full flex-col overflow-hidden rounded-input border text-center transition-colors duration-200",
        isUsed
          ? "border-stroke bg-whiteBackground cursor-not-allowed opacity-50 grayscale"
          : isSelected
            ? "border-primaryText bg-grey"
            : "hover:border-stroke border-transparent bg-[#292D35]",
      )}
      onClick={() => !isUsed && current.set(reason)}
    >
      <span
        className={cn(
          "border-stroke absolute right-2 top-2 z-10 h-4 w-4 rounded-full border",
          isSelected &&
            "border-peach bg-peach shadow-[inset_0_0_0_3px_#292D35]",
        )}
      />
      <div className="flex h-[99px] w-full items-center justify-center overflow-hidden bg-[#1E2129]">
        {images ? (
          images.map((image) => (
            <Image
              key={image}
              width={156}
              height={99}
              className={cn(
                "h-full object-cover mix-blend-screen [filter:invert(1)_hue-rotate(180deg)]",
                images.length > 1 ? "w-1/2" : "w-full",
              )}
              alt=""
              src={image}
            />
          ))
        ) : (
          <span className="text-4xl text-peach" aria-hidden>
            ID
          </span>
        )}
      </div>
      <strong className="mt-4 px-3 text-sm font-semibold">{label}</strong>
      <span className="text-secondaryText mt-4 px-3 pb-4 text-xs font-normal leading-[normal]">
        {description}
      </span>
      {isUsed && (
        <span className="text-status-rejected mt-auto pb-3 text-xs">
          Already used
        </span>
      )}
    </button>
  );
};

interface ChallengeInterface {
  pohId: Hash;
  requestIndex: number;
  revocation: boolean;
  arbitrationCost: bigint;
  arbitrationInfo: ContractData["arbitrationInfo"];
  usedReasons?: string[];
  disabled?: boolean;
  tooltip?: string;
}

export default function Challenge({
  pohId,
  requestIndex,
  revocation,
  arbitrationCost,
  arbitrationInfo,
  usedReasons = [],
  disabled: externalDisabled,
  tooltip: externalTooltip,
}: ChallengeInterface) {
  const { uploadFile } = useAtlasProvider();
  const { pendingAction, applyAction } = useRequestOptimistic();
  const chain = useChainParam()!;
  const unit = nativeCurrencyLabel(chain.id);
  const userChainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const isReconciling = pendingAction !== null;
  const defaultReason: Reason = "none";

  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const reason$ = useObservable<Reason>(defaultReason);
  const reason = reason$.use();

  const [justification, setJustification] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setJustification("");
    setFile(null);
    setPolicyAccepted(false);
    reason$.set(defaultReason);
    loading.stop();
  }, [defaultReason, loading, reason$]);

  const [prepare] = usePoHWrite(
    "challengeRequest",
    useMemo(
      () => ({
        onReady(fire) {
          loading.stop();
          fire();
          loading.start("Executing...");
          toast.info("Transaction pending");
        },
        onFail() {
          loading.stop();
          toast.error("Transaction failed");
        },
        onError(error, errorCtx) {
          loading.stop();
          toast.error(getWriteErrorMessage(error, errorCtx));
        },
        onSuccess() {
          applyAction("challenge", buildChallengeSuccessPatch(revocation));
          closeModal();
          toast.success("Challenge submitted successfully");
        },
      }),
      [applyAction, closeModal, loading, revocation],
    ),
  );

  const submit = useCallback(async () => {
    if (
      !justification.trim() ||
      !policyAccepted ||
      (!revocation && (reason === "none" || usedReasons.includes(reason)))
    )
      return;

    loading.start("Uploading...");
    try {
      const { evidenceUri } = await uploadEvidence(uploadFile, {
        name: "Challenge Justification",
        description: justification,
        file,
      });

      loading.start("Challenging...");
      prepare({
        value: arbitrationCost,
        args: [
          pohId,
          BigInt(requestIndex),
          REASON_INDEX[revocation ? "none" : reason],
          evidenceUri,
        ],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload evidence.",
      );
      loading.stop();
    }
  }, [
    revocation,
    reason,
    justification,
    file,
    policyAccepted,
    usedReasons,
    prepare,
    arbitrationCost,
    pohId,
    requestIndex,
    uploadFile,
    loading,
  ]);

  const isReasonUsed = (reason: Reason): boolean => {
    return usedReasons.includes(reason);
  };

  const funds = useEnoughFunds({ chainId: chain.id, amount: arbitrationCost });
  const { disabled: submitDisabled, tooltip: submitTooltip } = resolveTxState([
    { active: isReconciling, message: "Waiting for indexer" },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
    { active: !justification.trim(), message: "Enter a justification" },
    {
      active: !revocation && reason === "none",
      message: "Select a challenging reason",
    },
    { active: funds.isLoading, message: "Checking balance" },
    { active: !policyAccepted, message: "Confirm that you read the Policy" },
    { active: funds.insufficient, message: funds.message },
  ]);

  const trigger = resolveTxState([
    { active: !!externalDisabled, message: externalTooltip },
    { active: isReconciling, message: "Waiting for indexer" },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
  ]);

  return (
    <>
      <ActionButton
        onClick={() => setIsOpen(true)}
        label="Challenge"
        disabled={trigger.disabled}
        tooltip={trigger.tooltip}
      />
      <RequestModal open={isOpen} onClose={closeModal} canClose={!isLoading}>
        <RequestModalHeader
          title={
            <>
              Challenge <span className="text-peach">this Profile</span>
            </>
          }
          description="In order to challenge this profile you need to deposit:"
        />
        <div className="mt-4 flex justify-center">
          <RequestAmountPill
            amount={`${formatEth(arbitrationCost)}${unit}`}
            icon={<CurrencyIcon symbol={unit} />}
          />
        </div>

        {!revocation && (
          <div className="mt-6">
            <p className="text-secondaryText mb-4 text-center text-sm">
              Select the challenge type
            </p>
            <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {CHALLENGE_REASON_CARDS.map((card) => (
                <ReasonCard
                  key={card.reason}
                  reason={card.reason}
                  label={card.label}
                  description={card.description}
                  current={reason$}
                  isUsed={isReasonUsed(card.reason)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex w-full flex-col gap-4">
          <EvidenceFormFields
            description={justification}
            file={file}
            onDescriptionChange={setJustification}
            onFileChange={setFile}
            disabled={isLoading}
          />
        </div>

        <RequestWarning>
          When someone challenges a profile, a case is opened in Kleros Court. A
          group of random jurors is selected to review the case. They look at
          the evidence from both sides and vote. The side with the most votes
          wins the dispute. Deposits, reimbursements, and rewards are
          distributed according to the final ruling and the contract rules. A
          losing challenger can lose their deposit. Before challenging, make
          sure you have read and understood the Policy below.
        </RequestWarning>

        <div className="mt-4 flex flex-col items-center justify-center gap-4 text-sm md:flex-row">
          <ALink
            className="inline-flex items-center gap-2 text-peach"
            href={ipfs(arbitrationInfo.policy)}
          >
            <span>Relevant Policy</span>
            <DocumentIcon className="h-4 w-4 fill-current" />
            <span className="text-secondaryText text-xs">
              (updated <TimeAgo time={arbitrationInfo.updateTime} />)
            </span>
          </ALink>
          <label className="text-secondaryText flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="rounded border-none text-peach focus:ring-peach"
              checked={policyAccepted}
              onChange={(event) => setPolicyAccepted(event.target.checked)}
              disabled={isLoading}
            />
            I confirm that I have read the Policy.
          </label>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <AuthGuard
            signInButtonProps={{
              className: "w-full sm:w-fit sm:min-w-[244px]",
            }}
          >
            <ActionButton
              disabled={submitDisabled}
              className="w-full sm:w-fit sm:min-w-[244px]"
              onClick={submit}
              isLoading={isLoading}
              label={
                loadingMessage ||
                `Challenge for ${formatEth(arbitrationCost)}${unit}`
              }
              tooltip={submitTooltip}
            />
          </AuthGuard>
          <ActionButton
            className="w-full sm:w-fit sm:min-w-[170px]"
            onClick={closeModal}
            label="Return"
            disabled={isLoading}
            variant="secondary"
          />
        </div>
      </RequestModal>
    </>
  );
}
