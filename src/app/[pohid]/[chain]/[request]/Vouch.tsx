import { useMemo } from "react";
import Modal from "components/Modal";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useSignTypedData } from "wagmi";
import { useEffectOnce } from "@legendapp/state/react";
import axios from "axios";
import { Contract } from "contracts";
import cn from "classnames";
import { toast } from "react-toastify";
import { SupportedChain } from "config/chains";

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
  const [prepare, addVouch] = usePoHWrite(
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
        },
      }),
      [],
    ),
  );

  useEffectOnce(() => {
    prepare({ args: [claimer, pohId] });
  });

  const expiration = useMemo(
    () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 6,
    [],
  );

  const { signTypedData } = useSignTypedData({
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
      } catch (err) {
        console.error(err);
        toast.error("Some error occurred");
      }
    },
  });

  const gaslessVouch = () => {
    signTypedData({
      domain: {
        name: "Proof of Humanity",
        chainId: chain.id,
        verifyingContract: Contract.ProofOfHumanity[chain.id] as any,
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
      <Modal
        formal
        header="Vouch"
        trigger={<button className="btn-main mb-2">Vouch</button>}
      >
        <div className="flex flex-col items-center p-4">
          <span className="txt m-2">
            Make sure the person exists and only vouch for people you have
            physically encountered. Note that in case a profile is removed for
            (Sybil attack) or (Identity theft), all people who had vouched for
            it get removed as well. Profiles that do not follow the Policy risk
            being challenged and removed. Make sure you read and understand the
            Policy before proceeding. Also take into account that although a
            gasless vouch is possible, it cannot be removed. Gasless vouches
            expire after one year.
          </span>
          <button
            className={cn(
              "outline-theme text-orange hover:btn-main mt-4 rounded p-2 text-xl font-medium outline -outline-offset-4 hover:outline-0",
            )}
            onClick={gaslessVouch}
          >
            VOUCH
          </button>
          <span
            className="text-orange mt-4 cursor-pointer text-sm underline underline-offset-2"
            onClick={addVouch}
          >
            or vouch on chain
          </span>
        </div>
      </Modal>
    )
  );
}
