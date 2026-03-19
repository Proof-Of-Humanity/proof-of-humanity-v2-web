import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useMemo } from "react";
import { useLoading } from "hooks/useLoading";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { toast } from "react-toastify";
import { useEffectOnce } from "@legendapp/state/react";
import { SupportedChain, idToChain } from "config/chains";
import ActionButton from "components/ActionButton";
import { applyOptimisticWriteSuccess } from "optimistic/applyOptimisticWriteSuccess";
import { useRequestOptimistic } from "optimistic/request";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

enableReactUse();

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
  const router = useRouter();
  const { address } = useAccount();
  const requestOptimistic = useRequestOptimistic();

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
        onSuccess(ctx) {
          applyOptimisticWriteSuccess(ctx, {
            request: {
              state: requestOptimistic.effective,
              applyPatch: requestOptimistic.applyPatch,
              address,
            },
          });
          toast.success("Request remove vouch successful");
          setTimeout(() => router.refresh(), 1000);
        },
      }),
      [loading, requestOptimistic, address, router],
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
