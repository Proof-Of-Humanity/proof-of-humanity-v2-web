import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useMemo } from "react";
import { useLoading } from "hooks/useLoading";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { toast } from "react-toastify";
import { useEffectOnce } from "@legendapp/state/react";
import { SupportedChain, idToChain } from "config/chains";
import ActionButton from "components/ActionButton";
import { useRequestOptimistic } from "optimistic/request";
import type { RequestOptimisticOverlay } from "optimistic/types";
import { useAccount } from "wagmi";

enableReactUse();

const normalizeAddress = (value: Address) => value.toLowerCase();

export const buildRemoveVouchSuccessPatch = (
  onChainVouches: Address[],
  validVouches: number,
  voucher: Address,
): RequestOptimisticOverlay | undefined => {
  const normalized = normalizeAddress(voucher);
  const nextOnChainVouches = onChainVouches.filter(
    (value) => normalizeAddress(value) !== normalized,
  );

  if (nextOnChainVouches.length === onChainVouches.length) return undefined;

  return {
    onChainVouches: nextOnChainVouches,
    validVouches: Math.max(0, validVouches - 1),
  };
};

interface RemoveVouchProps {
  pohId: Hash;
  requester: Address;
  web3Loaded: any;
  chain: SupportedChain;
  userChainId: number;
  disabled?: boolean;
  tooltip?: string;
}

export default function RemoveVouch({
  pohId,
  requester,
  web3Loaded,
  chain,
  userChainId,
  disabled,
  tooltip,
}: RemoveVouchProps) {
  const loading = useLoading();
  const { effective, applyPatch } = useRequestOptimistic();
  const { address } = useAccount();

  const [prepareRemoveVouch, removeOnchainVouch, status] = usePoHWrite(
    "removeVouch",
    useMemo(
      () => ({
        onError() {
          toast.error("Transaction rejected");
        },
        onLoading() {
          loading.start();
          toast.info("Transaction pending");
        },
        onSuccess() {
          if (!address) return;
          const patch = buildRemoveVouchSuccessPatch(
            effective.onChainVouches,
            effective.validVouches,
            address,
          );
          if (patch) {
            applyPatch(patch);
          }
          toast.success("Request remove vouch successful");
        },
      }),
      [address, applyPatch, effective.onChainVouches, effective.validVouches, loading],
    ),
  );

  useEffectOnce(() => {
    prepareRemoveVouch({ args: [requester, pohId] });
  });

  return (
    web3Loaded &&
    (userChainId === chain.id || disabled) && (
      <div className="flex gap-4">
        <ActionButton
          onClick={removeOnchainVouch}
          label="Remove Vouch"
          className="mb-2 w-auto"
          isLoading={status.write === "pending"}
          disabled={status.write === "pending" || disabled || userChainId !== chain.id}
          tooltip={tooltip || (userChainId !== chain.id ? `Switch your chain above to ${idToChain(chain.id)?.name || 'the correct chain'}` : undefined)}
        />
      </div>
    )
  );
}
