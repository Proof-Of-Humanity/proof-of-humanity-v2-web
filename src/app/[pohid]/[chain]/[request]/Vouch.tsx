import { useMemo, useState } from "react";
import RequestModal from "components/RequestModal";
import VouchModalContent, { VouchMethod } from "./VouchModalContent";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useSignTypedData, useChainId } from "wagmi";
import { useEffectOnce } from "@legendapp/state/react";
import axios from "axios";
import { getContractInfo } from "contracts";
import { toast } from "react-toastify";
import { SupportedChain, idToChain } from "config/chains";
import ActionButton from "components/ActionButton";
import { useRequestOptimistic } from "optimistic/request";
import type { RequestOptimisticOverlay } from "optimistic/types";
import { resolveTxState } from "utils/txState";

const normalizeAddress = (value: Address) => value.toLowerCase();

const hasExistingVouch = (
  onChainVouches: Address[],
  offChainVouches: Array<{ voucher: Address }>,
  voucher: Address,
) => {
  const normalized = normalizeAddress(voucher);
  return (
    onChainVouches.some((value) => normalizeAddress(value) === normalized) ||
    offChainVouches.some(
      (value) => normalizeAddress(value.voucher) === normalized,
    )
  );
};

export const buildAddVouchSuccessPatch = (
  onChainVouches: Address[],
  offChainVouches: {
    voucher: Address;
    expiration: number;
    signature: `0x${string}`;
  }[],
  validVouches: number,
  voucher: Address,
): RequestOptimisticOverlay | undefined => {
  if (hasExistingVouch(onChainVouches, offChainVouches, voucher))
    return undefined;

  return {
    onChainVouches: [...onChainVouches, voucher],
    validVouches: validVouches + 1,
  };
};

export const buildGaslessVouchSuccessPatch = (
  onChainVouches: Address[],
  offChainVouches: {
    voucher: Address;
    expiration: number;
    signature: `0x${string}`;
  }[],
  validVouches: number,
  voucher: { voucher: Address; expiration: number; signature: `0x${string}` },
): RequestOptimisticOverlay | undefined => {
  if (hasExistingVouch(onChainVouches, offChainVouches, voucher.voucher))
    return undefined;

  return {
    offChainVouches: [...offChainVouches, voucher],
    validVouches: validVouches + 1,
  };
};

interface VouchButtonProps {
  pohId: Hash;
  claimer: Address;
  web3Loaded: any;
  me: any;
  chain: SupportedChain;
  address: Address | undefined;
  disabled?: boolean;
  tooltip?: string;
}

export default function Vouch({
  pohId,
  claimer,
  web3Loaded,
  me,
  chain,
  address,
  disabled: externalDisabled,
  tooltip: externalTooltip,
}: VouchButtonProps) {
  const { effective, pendingAction, applyAction } = useRequestOptimistic();
  const userChainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isReconciling = pendingAction !== null;
  const [prepare, addVouch, status] = usePoHWrite(
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
          if (!address) return;
          const patch = buildAddVouchSuccessPatch(
            effective.onChainVouches,
            effective.offChainVouches,
            effective.validVouches,
            address,
          );
          if (patch) {
            applyAction("vouch", patch);
          }
          toast.success("Vouched successfully");
          setSubmitted(true);
        },
      }),
      [
        address,
        applyAction,
        effective.offChainVouches,
        effective.onChainVouches,
        effective.validVouches,
      ],
    ),
  );

  useEffectOnce(() => {
    prepare({ args: [claimer, pohId] });
  });

  const isOnchainLoading =
    status.prepare === "pending" ||
    status.write === "pending" ||
    // Keep the onchain-vouch link locked while the tx is mining, otherwise it
    // re-enables after wallet confirmation and allows a duplicate addVouch.
    (status.write === "success" && status.transaction === "pending");

  const expiration = useMemo(
    () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 6,
    [],
  );

  const signTypedDataConfig = useMemo(
    () => ({
      mutation: {
        onSuccess: async (signature: `0x${string}`) => {
          try {
            await axios.post(`/api/vouch/${chain.name}/add`, {
              claimer,
              pohId,
              voucher: address!,
              expiration,
              signature,
            });
            const patch = buildGaslessVouchSuccessPatch(
              effective.onChainVouches,
              effective.offChainVouches,
              effective.validVouches,
              {
                voucher: address!,
                expiration,
                signature,
              },
            );
            if (patch) {
              applyAction("vouch", patch);
            }
            toast.success("Vouched successfully");
            setSubmitted(true);
          } catch (err) {
            console.error(err);
            toast.error("Error vouching. Please try again.");
          }
        },
        onError: (error: Error) => {
          console.error(error);
          toast.error("Error vouching. Please try again.");
        },
      },
    }),
    [
      address,
      applyAction,
      chain.name,
      claimer,
      effective.offChainVouches,
      effective.onChainVouches,
      effective.validVouches,
      expiration,
      pohId,
    ],
  );
  const { signTypedData, isPending } = useSignTypedData(signTypedDataConfig);

  // One lock across both paths (gasless sign + on-chain tx) so they can't
  // overlap and the modal can't close mid-submission.
  const isSubmitting = isOnchainLoading || isPending;

  const gaslessVouch = () => {
    signTypedData({
      domain: {
        name: "Proof of Humanity",
        chainId: chain.id,
        verifyingContract: getContractInfo("ProofOfHumanity", chain.id)
          .address as `0x${string}`,
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

  const handleVouch = (method: VouchMethod) => {
    if (method === "gasless") gaslessVouch();
    else addVouch();
  };

  const isRegistrationValid = !me?.expirationTime
    ? false
    : me.expirationTime > Date.now() / 1000;

  const trigger = resolveTxState([
    { active: !!externalDisabled, message: externalTooltip },
    { active: isReconciling, message: "Waiting for indexer" },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
  ]);
  const closeModal = () => {
    setIsOpen(false);
    setSubmitted(false);
  };

  return (
    web3Loaded &&
    me &&
    me.homeChain?.id === chain.id &&
    me.pohId &&
    isRegistrationValid && (
      <>
        <ActionButton
          onClick={() => {
            setSubmitted(false);
            setIsOpen(true);
          }}
          label="Vouch"
          className="mb-2 w-auto"
          disabled={trigger.disabled}
          tooltip={trigger.tooltip}
        />
        <RequestModal
          open={isOpen}
          onClose={closeModal}
          canClose={!isSubmitting}
        >
          <VouchModalContent
            submitted={submitted}
            onClose={closeModal}
            onVouch={handleVouch}
            isSubmitting={isSubmitting}
            disabled={isReconciling}
            tooltip={isReconciling ? "Waiting for indexer" : undefined}
          />
        </RequestModal>
      </>
    )
  );
}
