import { formatEther, parseEther } from "ethers";
import { useState } from "react";
import { RequestQueryItem } from "api/types";
import Field from "components/Field";
import Modal from "components/Modal";
import { useFundRequest } from "hooks/useProofOfHumanity";
import { formatEth } from "utils/misc";

interface FundButtonProps {
  totalCost?: bigint;
  funded: bigint;
  request: RequestQueryItem;
}

const FundButton: React.FC<FundButtonProps> = ({
  totalCost,
  funded,
  request,
}) => {
  const fundRequest = useFundRequest();
  const [funding, setFunding] = useState<number>(
    parseFloat(formatEther(totalCost ? totalCost - funded : 0))
  );

  if (!totalCost || totalCost == funded) return null;

  return (
    <Modal
      formal
      header="Fund"
      trigger={<button className="btn-main mb-2">Fund request</button>}
    >
      <div className="p-4 flex flex-col">
        <div className="w-full p-4 flex justify-center rounded font-bold">
          {formatEth(totalCost - funded)} Remaining ETH Deposit
        </div>
        <Field
          type="number"
          className="no-spinner"
          label="Amount funding"
          min={0}
          max={formatEther(totalCost - funded)}
          step={0.01}
          value={funding}
          onChange={(event) => setFunding(parseFloat(event.target.value))}
        />
        <button
          onClick={async () =>
            await fundRequest(request.requester, {
              value: parseEther(funding.toString()),
            })
          }
          className="btn-main mt-12"
        >
          Fund request
        </button>
      </div>
    </Modal>
  );
};

export default FundButton;
