import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Field from "components/Field";
import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { useLoading } from "hooks/useLoading";
import { Hash, formatEther, parseEther } from "viem";
import useChainParam from "hooks/useChainParam";
import { useChainId } from "wagmi";
import { formatEth } from "utils/misc";

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
  const chain = useChainParam()!;
  const userChainId = useChainId();
  const [addedFundInput, setAddedFundInput] = useState("");
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();

  console.log(addedFundInput);

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
          toast.success("Request funded successfully");

          setAddedFundInput("");
        },
      }),
      [loading],
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

  const isDisabled = !addedFundInput|| isLoading || userChainId !== chain.id;

  return (
    <Modal
      formal
      header="Fund"
      trigger={<button className="btn-sec mb-2">Fund</button>}
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
          className="mt-12"
          label={loadingMessage || "Fund request"}
        />
      </div>
    </Modal>
  );
};

export default FundButton;
