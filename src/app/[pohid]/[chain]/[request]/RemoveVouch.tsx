import usePoHWrite from "contracts/hooks/usePoHWrite";
import { Address, Hash } from "viem";
import { useMemo } from "react";
import { useLoading } from "hooks/useLoading";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { toast } from "react-toastify";
import { useEffectOnce } from "@legendapp/state/react";
import { SupportedChain } from "config/chains";
import ActionButton from "components/ActionButton";

enableReactUse();

interface RemoveVouchProps {
  pohId: Hash;
  requester: Address;
  web3Loaded: any;
  chain: SupportedChain;
  userChainId: number;
}

export default function RemoveVouch({
  pohId,
  requester,
  web3Loaded,
  chain,
  userChainId,
}: RemoveVouchProps) {
  const loading = useLoading();
  const [pending] = loading.use();

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
          toast.success("Request remove vouch successful");
        },
      }),
      [loading],
    ),
  );

  useEffectOnce(() => {
    prepareRemoveVouch({ args: [requester, pohId] });
  });

  return (
    web3Loaded &&
    userChainId === chain.id && (
      <div className="flex gap-4">
        <ActionButton
          onClick={removeOnchainVouch}
          label="Remove Vouch"
          className="mb-2"
          isLoading={status.write === "pending"}
          disabled={status.write === "pending"}
        />
      </div>
    )
  );
}
