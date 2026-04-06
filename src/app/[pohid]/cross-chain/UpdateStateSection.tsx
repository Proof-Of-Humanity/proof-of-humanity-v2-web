"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useChainId } from "wagmi";

import ChainLogo from "components/ChainLogo";
import Modal from "components/Modal";
import {
  SupportedChainId,
  supportedChains,
  type SupportedChain,
} from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import type { ProfileHumanityQuery } from "generated/graphql";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";
import { timeAgo } from "utils/time";
import {
  ACTION_STATES,
  isActionStateError,
  isActionStateLoading,
  WAITING_FOR_INDEXER_TOOLTIP,
} from "../useActionFeedback";
import useActionFeedback from "../useActionFeedback";
import ProfileErrorCard from "../ProfileErrorCard";

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
  const chainId = useChainId() as SupportedChainId;
  const { pendingAction, applyAction } = useProfileOptimistic();
  const web3Loaded = useWeb3Loaded();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const isReconciling = pendingAction !== null;
  const {
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();
  const [prepareUpdate, , updateStatus] = useCCPoHWrite(
    "updateHumanity",
    useMemo(
      () => ({
        onLoading() {
          setFeedbackState(ACTION_STATES.txPending);
        },
        onReady(fire: () => void) {
          setFeedbackState(ACTION_STATES.confirmWallet);
          fire();
        },
        onSuccess() {
          applyAction("update", buildUpdateSuccessPatch());
          toast.success("Update transaction sent!");
          setIdle();
          setIsUpdateModalOpen(false);
        },
        onError(error) {
          toast.error(setWriteError(error));
        },
        onFail() {
          const message = "Update is not available right now.";
          setUnavailable(message);
          toast.error(message);
        },
      }),
      [applyAction, setFeedbackState, setIdle, setUnavailable, setWriteError],
    ),
  );

  const hasUpdateInFlight =
    updateStatus.write === "pending" ||
    (updateStatus.write === "success" &&
      updateStatus.transaction === "pending");

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    if (!hasUpdateInFlight) {
      setIdle();
    }
  }, [hasUpdateInFlight, setIdle]);
  const sectionState =
    !web3Loaded || homeChain.id !== chainId
      ? "hidden"
      : pendingAction === "update"
        ? "pending"
        : "action";

  if (sectionState === "hidden") {
    return null;
  }

  if (sectionState === "pending") {
    return (
      <div className="group relative">
        <button className="text-sky-500" disabled>
          Update state
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          {WAITING_FOR_INDEXER_TOOLTIP}
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="group relative">
        <button
          className="text-sky-500"
          disabled={isReconciling}
          onClick={() => setIsUpdateModalOpen(true)}
        >
          Update state
        </button>
        {isReconciling ? (
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            {WAITING_FOR_INDEXER_TOOLTIP}
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          </span>
        ) : null}
      </div>
      <Modal
        formal
        open={isUpdateModalOpen}
        onClose={closeUpdateModal}
        canClose={!hasUpdateInFlight && !isActionStateLoading(actionState)}
        header="Update"
      >
        <div className="p-4">
          <span className="txt text-primaryText m-2">
            Update humanity state on another chain. If you use wallet contract
            make sure it has same address on both chains.
          </span>
          {isActionStateLoading(actionState) ? (
            <div className="paper border-stroke bg-whiteBackground mt-4 px-3 py-2">
              <span className="text-secondaryText text-sm font-medium">
                {actionMessage}
              </span>
            </div>
          ) : null}
          {isActionStateError(actionState) ? (
            <div className="mt-4">
              <ProfileErrorCard title={actionMessage ?? ""} />
            </div>
          ) : null}

          <div className="mt-4">
            {supportedChains.map((chain) => {
              const crossChainReg = humanity[chain.id].crossChainRegistration;
              const isExpired = crossChainReg
                ? Number(crossChainReg.expirationTime) < Date.now() / 1000
                : true;
              const isValid =
                chain.id === homeChain.id || (crossChainReg && !isExpired);

              return (
                <div
                  key={chain.id}
                  className="text-primaryText m-2 flex items-center justify-between gap-4 border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center">
                      <ChainLogo
                        chainId={chain.id}
                        className="fill-primaryText mr-1 h-4 w-4"
                      />
                      {chain.name} {isValid ? "✔" : "❌"}
                    </div>
                    <div className="text-secondaryText mt-1 text-sm">
                      {chain.id === homeChain.id ? (
                        <span>Home chain</span>
                      ) : crossChainReg ? (
                        <span className={isExpired ? "text-orange-500" : ""}>
                          {isExpired ? "Expired " : "Expires "}
                          {timeAgo(crossChainReg.expirationTime)}
                        </span>
                      ) : (
                        <span>No cross-chain registration yet.</span>
                      )}
                    </div>
                  </div>

                  {chain.id === homeChain.id ? (
                    <div className="text-secondaryText text-sm font-medium">
                      Source
                    </div>
                  ) : (
                    <button
                      className="disabled:text-secondaryText shrink-0 text-blue-500 underline underline-offset-2 disabled:cursor-not-allowed disabled:no-underline"
                      disabled={
                        isActionStateLoading(actionState) || hasUpdateInFlight
                      }
                      onClick={() => {
                        setIdle();

                        prepareUpdate({
                          args: [gatewayId, pohId],
                        });
                      }}
                    >
                      {isActionStateLoading(actionState) || hasUpdateInFlight
                        ? "Processing..."
                        : "Update state"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
