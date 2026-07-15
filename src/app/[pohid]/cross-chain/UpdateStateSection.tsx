"use client";

import { useAppKit } from "@reown/appkit/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import ActionButton from "components/ActionButton";
import ChainLogo from "components/ChainLogo";
import CopyButton from "components/CopyButton";
import Modal from "components/Modal";
import {
  SupportedChainId,
  supportedChains,
  type SupportedChain,
} from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import type { ProfileHumanityQuery } from "generated/graphql";
import { getWriteErrorMessage } from "hooks/useActionFeedback";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";
import { timeAgo } from "utils/time";
import { prettifyId } from "utils/identifier";
import CheckCircleIcon from "icons/CheckCircleOutline.svg";
import LoadingIcon from "icons/Loading.svg";
import Image from "next/image";
import {
  CROSS_CHAIN_MODAL_CLASS,
  CrossChainActionTrigger,
  CrossChainModalHeading,
} from "./crossChainUi";

const buildUpdateSuccessPatch = () => ({
  hasPendingUpdateRelay: true,
});

export default function UpdateStateSection({
  humanity,
  homeChain,
  gatewayId,
  pohId,
}: {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  homeChain: SupportedChain;
  gatewayId: `0x${string}`;
  pohId: `0x${string}`;
}) {
  const modal = useAppKit();
  const { isConnected } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const { pendingAction, applyAction } = useProfileOptimistic();
  const web3Loaded = useWeb3Loaded();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const isReconciling = pendingAction !== null;
  const [prepareUpdate, , updateStatus] = useCCPoHWrite(
    "updateHumanity",
    useMemo(
      () => ({
        onReady(fire: () => void) {
          fire();
        },
        onSuccess() {
          applyAction("update", buildUpdateSuccessPatch());
          toast.success("Update transaction sent!");
          setIsUpdateModalOpen(false);
        },
        onError(error) {
          toast.error(getWriteErrorMessage(error));
        },
        onFail() {
          toast.error("Update is not available right now.");
        },
      }),
      [applyAction],
    ),
  );

  const hasUpdateInFlight =
    updateStatus.write === "pending" ||
    (updateStatus.write === "success" &&
      updateStatus.transaction === "pending");

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);
  const openConnectWallet = useCallback(() => {
    setIsUpdateModalOpen(false);
    window.setTimeout(() => {
      modal.open({ view: "Connect" });
    }, 0);
  }, [modal]);
  const sectionState = !web3Loaded
    ? "hidden"
    : pendingAction === "update"
      ? "pending"
      : "action";
  const updateGuardState = !isConnected
    ? "connect-wallet"
    : homeChain.id !== chainId
      ? "switch-chain"
      : "ready";

  if (sectionState === "hidden") {
    return null;
  }

  if (sectionState === "pending") {
    return (
      <CrossChainActionTrigger
        label="Update state"
        icon={LoadingIcon}
        disabled
        showTooltip
        className="basis-full text-center"
      />
    );
  }

  return (
    <>
      <CrossChainActionTrigger
        label="Update state"
        icon={LoadingIcon}
        onClick={() => setIsUpdateModalOpen(true)}
        disabled={isReconciling}
        showTooltip={isReconciling}
        className="basis-full text-center"
      />
      <Modal
        formal
        className={CROSS_CHAIN_MODAL_CLASS}
        open={isUpdateModalOpen}
        onClose={closeUpdateModal}
        canClose={!hasUpdateInFlight}
      >
        <div className="flex flex-col items-center gap-8 p-8 text-center">
          <CrossChainModalHeading title="Update your POH ID state on another chain" />
          {updateGuardState !== "ready" ? (
            <>
              <span className="txt text-primaryText m-2 text-center">
                {updateGuardState === "connect-wallet"
                  ? "Connect your wallet on the home chain to review destination chains and submit the state update."
                  : "State updates must be submitted from the home chain wallet before you can choose the destination chain."}
              </span>
              <div className="mt-4 flex justify-center">
                <button
                  className="btn-primary"
                  onClick={
                    updateGuardState === "connect-wallet"
                      ? openConnectWallet
                      : () => switchChain({ chainId: homeChain.id })
                  }
                >
                  {updateGuardState === "connect-wallet"
                    ? "Connect wallet"
                    : `Switch to ${homeChain.name}`}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full flex-col gap-4">
                {supportedChains.map((chain) => {
                  const crossChainReg =
                    humanity[chain.id].crossChainRegistration;
                  const isExpired = crossChainReg
                    ? Number(crossChainReg.expirationTime) < Date.now() / 1000
                    : true;
                  return (
                    <div
                      key={chain.id}
                      className="border-stroke bg-whiteBackground text-primaryText flex min-h-12 items-center justify-between gap-4 rounded-btn border px-4 py-1"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Image
                          alt="POH ID"
                          className="h-10 w-10 shrink-0"
                          height={40}
                          src="/logo/pohid.svg"
                          width={40}
                        />
                        <div className="flex shrink-0 items-center">
                          <ChainLogo chainId={chain.id} className="h-6 w-6" />
                        </div>
                        <span className="truncate text-sm text-peach">
                          {prettifyId(pohId)}
                        </span>
                        <CopyButton value={prettifyId(pohId)} />
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        {chain.id === homeChain.id ? (
                          <>
                            <span>Home Chain</span>
                            <CheckCircleIcon className="text-status-registered h-4 w-4" />
                          </>
                        ) : crossChainReg ? (
                          <span
                            className={
                              isExpired ? "text-orange" : "text-secondaryText"
                            }
                          >
                            {isExpired ? "Expired " : "Expires "}
                            {timeAgo(crossChainReg.expirationTime)}
                          </span>
                        ) : (
                          <span className="text-secondaryText">
                            Not registered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <ActionButton
                className="w-[170px]"
                disabled={hasUpdateInFlight}
                isLoading={hasUpdateInFlight}
                label={hasUpdateInFlight ? "Updating..." : "Update"}
                onClick={() => prepareUpdate({ args: [gatewayId, pohId] })}
              />
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
