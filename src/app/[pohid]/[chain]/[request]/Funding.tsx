import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Field from "components/Field";
import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { useLoading } from "hooks/useLoading";
import { Hash, formatEther, parseEther } from "viem";
import useChainParam from "hooks/useChainParam";
import { useRouter } from "next/navigation";
import { useAccount, useBalance, useChainId } from "wagmi";
import { formatEth } from "utils/misc";
import { idToChain } from "config/chains";

interface FundButtonProps {
  pohId: Hash;
  index: number;
  totalCost: bigint;
  funded: bigint;
}

const FundButton: React.FC<FundButtonProps> = ({
  pohId,
  index,
  totalCost,
  funded,
}) => {
  const router = useRouter();
  const chain = useChainParam()!;
  const userChainId = useChainId();
  const [addedFundInput, setAddedFundInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isConnected, address} = useAccount();
  const { data: balanceData } = useBalance({ address, chainId: userChainId });
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();

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
        onSuccess() {
          loading.stop();
          setIsModalOpen(false);
          setAddedFundInput("");
          toast.success("Request funded successfully");
          setTimeout(() => router.refresh(), 1000);
        },
      }),
      [loading, router],
    ),
  );

  const remainingAmount = totalCost - funded;
  const maxFundAmount = formatEther(remainingAmount);

  const handleSubmit = () => {
    if (!addedFundInput) return;
    
    loading.start("Funding...");
    prepareFund({
      value: BigInt(parseEther(addedFundInput)),
      args: [pohId, BigInt(index)],
    });
  };
  const inputAmount = parseEther(addedFundInput);
  const insufficientFunds = useMemo(() => {
    const available = balanceData?.value ?? 0n;
    return inputAmount > available;
  }, [inputAmount, balanceData, addedFundInput]);

  const exceedsRemaining = inputAmount != null && inputAmount > remainingAmount;
  
  const isDisabled =
    !isConnected ||
    !addedFundInput ||
    isLoading ||
    userChainId !== chain.id ||
    exceedsRemaining ||
    insufficientFunds;

  const getTooltipMessage = () => {
    if (!isConnected) return "Please connect your wallet";
    if (userChainId !== chain.id) return `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}`;
    if (!addedFundInput) return "Please enter an amount to fund";
    if (exceedsRemaining) return `Amount exceeds remaining needed (${formatEth(remainingAmount)} ${chain.nativeCurrency.symbol})`;
    if (insufficientFunds) return `Insufficient balance. You have ${formatEth(balanceData?.value ?? 0n)} ${chain.nativeCurrency.symbol}`;
    if (isLoading) return "Transaction in progress";
    return undefined;
  };

  return (
    <>
      <ActionButton
        onClick={() => setIsModalOpen(true)}
        label="Fund"
        className="mb-2"
        disabled={userChainId !== chain.id}
        tooltip={userChainId !== chain.id ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}` : undefined}
      />
      <Modal
        formal
        header="Fund"
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col p-4">
        <div className="flex w-full justify-center rounded p-4 font-bold">
          <span
            onClick={() => setAddedFundInput(formatEth(remainingAmount).toString())}
            className="text-orange mx-1 cursor-pointer font-semibold underline underline-offset-2"
          >
            {maxFundAmount}
          </span>{" "}
          <span className="text-primaryText">{chain.nativeCurrency.symbol} Needed</span>
        </div>
        <Field
          type="number"
          className="no-spinner"
          label="Amount funding"
          step="any"
          min={0}
          max={maxFundAmount}
          value={addedFundInput}
          onChange={(e) => setAddedFundInput(e.target.value)}
          disabled={isLoading}
        />
        <ActionButton
          disabled={isDisabled}
          isLoading={isLoading}
          onClick={handleSubmit}
          className="mt-6 mx-auto"
          label={loadingMessage || "Fund request"}
          tooltip={getTooltipMessage()}
        />
      </div>
      </Modal>
    </>
  );
};

export default FundButton;
