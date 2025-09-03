import { useMemo, useState } from "react";
import Modal from "components/Modal";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useSignTypedData } from "wagmi";
import { useEffectOnce } from "@legendapp/state/react";
import axios from "axios";
import { getContractInfo } from "contracts";
import { toast } from "react-toastify";
import { SupportedChain } from "config/chains";
import ActionButton from "components/ActionButton";

interface VouchButtonProps {
  pohId: Hash;
  claimer: Address;
  web3Loaded: any;
  me: any;
  chain: SupportedChain;
  address: Address | undefined;
}

export default function Vouch({
  pohId,
  claimer,
  web3Loaded,
  me,
  chain,
  address,
}: VouchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prepare, addVouch , status] = usePoHWrite(
    "addVouch",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onLoading() {
          toast.info("Transaction pending");
        },
        onSuccess() {
          toast.success("Vouched successfully");
          setIsOpen(false);
        },
      }),
      [],
    ),
  );

  useEffectOnce(() => {
    prepare({ args: [claimer, pohId] });
  });

  const isOnchainLoading =
  status.prepare === "pending" ||
  status.write === "pending";

  const expiration = useMemo(
    () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 6,
    [],
  );

  const { signTypedData , isPending } = useSignTypedData({
    mutation: {
      onSuccess: async (signature) => {
        try {
          await axios.post(`/api/vouch/${chain.name}/add`, {
            claimer,
            pohId,
            voucher: address!,
            expiration,
            signature,
          });
          toast.success("Vouched successfully");
          setIsOpen(false);
        } catch (err) {
          console.error(err);
          toast.error("Error vouching. Please try again.");
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error vouching. Please try again.");
      },
    },
  });

  const gaslessVouch = () => {
    signTypedData({
      domain: {
        name: "Proof of Humanity",
        chainId: chain.id,
        verifyingContract: getContractInfo("ProofOfHumanity", chain.id).address as `0x${string}`,
      },
      types: {
        IsHumanVoucher: [
          { name: "vouched", type: "address" },
          { name: "humanityId", type: "bytes20" },
          { name: "expirationTimestamp", type: "uint256" },
        ],
      },
      primaryType: "IsHumanVoucher",
      message: {
        vouched: claimer,
        humanityId: pohId,
        expirationTimestamp: BigInt(expiration),
      },
    });
  };

  return (
    web3Loaded &&
    me &&
    me.homeChain?.id === chain.id &&
    me.pohId && (
      <>
        <button className="btn-main mb-2" onClick={() => setIsOpen(true)}>
          Vouch
        </button>
        <Modal
          formal
          header="Vouch"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="flex flex-col items-center p-4">
            <span className="txt m-2 text-primaryText">
              Make sure the person exists and only vouch for people you have
              physically encountered. Note that in case a profile is removed for
              (Sybil attack) or (Identity theft), all people who had vouched for
              it get removed as well. Profiles that do not follow the Policy risk
              being challenged and removed. Make sure you read and understand the
              Policy before proceeding. Also take into account that although a
              gasless vouch is possible, it cannot be removed. Gasless vouches
              expire after one year.
            </span>
            <ActionButton
              onClick={gaslessVouch}
              label="VOUCH"
              className="mt-4"
              isLoading={isPending}
              disabled={isPending}
              variant="primary"
            />
            <span
              className={`text-orange mt-4 text-sm underline underline-offset-2 ${
                isOnchainLoading
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
              onClick={() => {
                if (isOnchainLoading) return;
                addVouch();
              }}
              aria-disabled={isOnchainLoading}
              aria-busy={isOnchainLoading}
            >
              or vouch on chain
            </span>
          </div>
        </Modal>
      </>
    )
  );
}
