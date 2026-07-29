import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CurrencyField from "components/CurrencyField";
import ActionButton from "components/ActionButton";
import Progress from "components/Progress";
import RequestModal, {
  RequestModalActions,
  RequestModalHeader,
} from "components/RequestModal";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { useLoading } from "hooks/useLoading";
import useFundingAmount from "hooks/useFundingAmount";
import { resolveTxState } from "utils/txState";
import type { RequestOptimisticOverlay } from "optimistic/types";
import { Hash, formatEther } from "viem";
import useChainParam from "hooks/useChainParam";
import { formatEth } from "utils/misc";
import { idToChain } from "config/chains";
import { useRequestOptimistic } from "optimistic/request";
import { getWriteErrorMessage } from "hooks/useActionFeedback";

export const buildFundSuccessPatch = (
  funded: bigint,
  totalCost: bigint,
  value: bigint,
): RequestOptimisticOverlay => ({
  funded: funded + value > totalCost ? totalCost : funded + value,
});

interface FundButtonProps {
  pohId: Hash;
  index: number;
  totalCost: bigint;
  funded: bigint;
  disabled?: boolean;
  tooltip?: string;
}

const FundButton: React.FC<FundButtonProps> = ({
  pohId,
  index,
  totalCost,
  funded,
  disabled: externalDisabled,
  tooltip: externalTooltip,
}) => {
  const { effective, pendingAction, applyAction } = useRequestOptimistic();
  const chain = useChainParam()!;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const isReconciling = pendingAction !== null;
  const {
    input: addedFundInput,
    setInput: setAddedFundInput,
    resetInput,
    inputAmount,
    remainingAmount,
    unit,
    isWrongChain,
    disabled: isDisabled,
    tooltip: submitTooltip,
  } = useFundingAmount({
    chainId: chain.id,
    funded,
    totalCost,
    defaultToRemaining: true,
    checks: [
      { active: isReconciling, message: "Waiting for indexer" },
      { active: isLoading },
    ],
  });
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetInput();
    loading.stop();
  }, [loading, resetInput]);

  const [prepareFund] = usePoHWrite(
    "fundRequest",
    useMemo(
      () => ({
        onReady(fire) {
          fire();
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
        onSuccess(ctx) {
          applyAction(
            "fund",
            buildFundSuccessPatch(
              effective.funded,
              effective.totalCost,
              ctx.value ?? 0n,
            ),
          );
          closeModal();
          toast.success("Request funded successfully");
        },
      }),
      [applyAction, closeModal, effective.funded, effective.totalCost, loading],
    ),
  );

  const maxFundAmount = formatEther(remainingAmount);
  const totalCostEth = formatEth(totalCost);
  const progress =
    totalCostEth > 0
      ? Math.min(100, (formatEth(funded) * 100) / totalCostEth)
      : 0;

  const handleSubmit = () => {
    if (inputAmount === null || inputAmount <= 0n) return;

    loading.start("Funding...");
    prepareFund({
      value: inputAmount,
      args: [pohId, BigInt(index)],
    });
  };

  const trigger = resolveTxState([
    { active: !!externalDisabled, message: externalTooltip },
    { active: isReconciling, message: "Waiting for indexer" },
    {
      active: isWrongChain,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
  ]);

  return (
    <>
      <ActionButton
        onClick={() => {
          setAddedFundInput(maxFundAmount);
          setIsModalOpen(true);
        }}
        label="Fund"
        variant="secondary"
        className="mb-2 w-auto"
        disabled={trigger.disabled}
        tooltip={trigger.tooltip}
      />
      <RequestModal
        open={isModalOpen}
        onClose={closeModal}
        canClose={!isLoading}
      >
        <RequestModalHeader
          title={
            <>
              Fund{" "}
              <span className="text-peach">the profile&apos;s submission</span>
            </>
          }
          description={
            <>
              <p>Anyone can help funding the profile&apos;s submission.</p>
              <p>Type the value you want to contribute below.</p>
            </>
          }
        />
        <div className="mt-12">
          <Progress
            value={progress}
            label={`${formatEth(funded)} ${unit} out of ${formatEth(totalCost)} ${unit} required`}
            labelClassName="text-primaryText"
          />
        </div>
        <div className="mt-4">
          <CurrencyField
            label={`Amount (${unit})`}
            labelClassName="!mb-2 !mt-0 text-sm !font-normal normal-case !text-secondaryText"
            symbol={unit}
            step="any"
            min={0}
            max={maxFundAmount}
            value={addedFundInput}
            onChange={(e) => setAddedFundInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <RequestModalActions onReturn={closeModal} returnDisabled={isLoading}>
          <ActionButton
            className="w-full sm:w-auto sm:min-w-[170px]"
            label={loadingMessage || "Fund"}
            onClick={handleSubmit}
            disabled={isDisabled}
            isLoading={isLoading}
            tooltip={submitTooltip}
          />
        </RequestModalActions>
      </RequestModal>
    </>
  );
};

export default FundButton;
