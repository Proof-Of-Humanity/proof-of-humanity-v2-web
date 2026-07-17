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
import { resolveTxState } from "utils/txState";
import { getWriteErrorMessage } from "hooks/useActionFeedback";

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
  const { effective, pendingAction, applyAction } = useRequestOptimistic();
  const { address } = useAccount();
  const isReconciling = pendingAction !== null;

  const [prepareRemoveVouch, removeOnchainVouch, status] = usePoHWrite(
    "removeVouch",
    useMemo(
      () => ({
        onError(error, errorCtx) {
          toast.error(getWriteErrorMessage(error, errorCtx));
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
            applyAction("removeVouch", patch);
          }
          toast.success("Request remove vouch successful");
        },
      }),
      [
        address,
        applyAction,
        effective.onChainVouches,
        effective.validVouches,
        loading,
      ],
    ),
  );

  useEffectOnce(() => {
    prepareRemoveVouch({ args: [requester, pohId] });
  });

  // Covers both the wallet-confirmation and tx-mining phases, matching the
  // other action buttons; `status.write` alone re-enables while still mining.
  const isRemoveVouchLoading =
    status.write === "pending" ||
    (status.write === "success" && status.transaction === "pending");

  const trigger = resolveTxState([
    { active: isReconciling, message: "Waiting for indexer" },
    { active: !!disabled, message: tooltip },
    {
      active: userChainId !== chain.id,
      message: `Switch your chain above to ${idToChain(chain.id)?.name || "the correct chain"}`,
    },
    { active: isRemoveVouchLoading },
  ]);

  return (
    web3Loaded &&
    (userChainId === chain.id || disabled) && (
      <ActionButton
        onClick={removeOnchainVouch}
        label="Remove Vouch"
        className="mb-2 w-auto"
        isLoading={isRemoveVouchLoading}
        disabled={trigger.disabled}
        tooltip={trigger.tooltip}
      />
    )
  );
}
