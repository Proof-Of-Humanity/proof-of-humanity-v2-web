import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CurrencyField from "components/CurrencyField";
import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { useLoading } from "hooks/useLoading";
import useEnoughFunds from "hooks/useEnoughFunds";
import { resolveTxState } from "utils/txState";
import type { RequestOptimisticOverlay } from "optimistic/types";
import { Hash, formatEther, parseEther } from "viem";
import useChainParam from "hooks/useChainParam";
import { useAccount, useChainId } from "wagmi";
import { formatEth } from "utils/misc";
import { idToChain } from "config/chains";
import { useRequestOptimistic } from "optimistic/request";

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
  const userChainId = useChainId();
  const [addedFundInput, setAddedFundInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected } = useAccount();
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setAddedFundInput("");
    loading.stop();
  }, [loading]);

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
        onError() {
          loading.stop();
          toast.error("Transaction rejected");
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

  const remainingAmount = totalCost - funded;
  const maxFundAmount = formatEther(remainingAmount);

  const inputAmount = useMemo(() => {
    if (!addedFundInput) return 0n;
    try {
      const parsed = parseEther(addedFundInput);
      return parsed < 0n ? 0n : parsed;
    } catch {
      return null;
    }
  }, [addedFundInput]);

  const isInvalidInput = inputAmount === null;
  const isNonPositive = !isInvalidInput && inputAmount! <= 0n;
  const exceedsRemaining = !isInvalidInput && inputAmount! > remainingAmount;
  const funds = useEnoughFunds({
    chainId: chain.id,
    amount: !isInvalidInput && inputAmount ? inputAmount : undefined,
  });
  const isReconciling = pendingAction !== null;

  const handleSubmit = () => {
    if (inputAmount === null || inputAmount <= 0n) return;

    loading.start("Funding...");
    prepareFund({
      value: inputAmount,
      args: [pohId, BigInt(index)],
    });
  };

  const { disabled: isDisabled, tooltip: submitTooltip } = resolveTxState([
    { active: isReconciling, message: "Syncing" },
    { active: !isConnected, message: "Please connect your wallet" },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
    { active: !addedFundInput, message: "Please enter an amount to fund" },
    { active: isInvalidInput, message: "Please enter a valid amount" },
    { active: isNonPositive, message: "Amount must be greater than 0" },
    {
      active: exceedsRemaining,
      message: `Amount exceeds remaining needed (${formatEth(remainingAmount)} ${chain.nativeCurrency.symbol})`,
    },
    { active: funds.isLoading, message: "Checking balance" },
    { active: funds.insufficient, message: funds.message },
    { active: isLoading },
  ]);

  const trigger = resolveTxState([
    { active: !!externalDisabled, message: externalTooltip },
    { active: isReconciling, message: "Syncing" },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
  ]);

  return (
    <>
      <ActionButton
        onClick={() => setIsModalOpen(true)}
        label="Fund"
        className="mb-2 w-auto"
        disabled={trigger.disabled}
        tooltip={trigger.tooltip}
      />
      <Modal
        formal
        header="Fund"
        open={isModalOpen}
        onClose={closeModal}
        canClose={!isLoading}
      >
        <div className="flex flex-col p-4">
          <div className="flex w-full justify-center rounded p-4 font-bold">
            <span
              onClick={() =>
                setAddedFundInput(formatEth(remainingAmount).toString())
              }
              className="text-orange mx-1 cursor-pointer font-semibold underline underline-offset-2"
            >
              {maxFundAmount}
            </span>{" "}
            <span className="text-primaryText">
              {chain.nativeCurrency.symbol} Needed
            </span>
          </div>
          <CurrencyField
            label="Amount funding"
            symbol={chain.nativeCurrency.symbol}
            step="any"
            min={0}
            max={maxFundAmount}
            value={addedFundInput}
            onChange={(e) => setAddedFundInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="mt-6 flex justify-center">
            <ActionButton
              disabled={isDisabled}
              isLoading={isLoading}
              onClick={handleSubmit}
              label={loadingMessage || "Fund request"}
              className="mx-auto w-auto"
              tooltip={submitTooltip}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FundButton;
