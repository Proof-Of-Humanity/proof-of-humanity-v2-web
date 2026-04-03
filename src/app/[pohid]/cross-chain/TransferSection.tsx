"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";

import ActionButton from "components/ActionButton";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import { SupportedChainId, type SupportedChain } from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";
import {
  ACTION_STATES,
  isActionStateError,
  isActionStateLoading,
  WAITING_FOR_INDEXER_TOOLTIP,
} from "../useActionFeedback";
import useActionFeedback from "../useActionFeedback";

const buildTransferSuccessPatch = ({
  previousLastTransferTimestamp,
}: {
  previousLastTransferTimestamp?: number;
}) => ({
  winningStatus: "transferring",
  lastTransferTimestamp: previousLastTransferTimestamp ?? 0,
  hasPendingTransferRelay: true,
});

export default function TransferSection({
  claimer,
  homeChain,
  gatewayId,
  transferCooldownEndsAt,
}: {
  claimer: `0x${string}`;
  homeChain: SupportedChain;
  gatewayId: `0x${string}`;
  transferCooldownEndsAt?: number;
}) {
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { base, pendingAction, applyAction } = useProfileOptimistic();
  const web3Loaded = useWeb3Loaded();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const isReconciling = pendingAction !== null;
  const nowSeconds = Date.now() / 1000;
  const {
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();
  const [prepareTransfer, , transferStatus] = useCCPoHWrite(
    "transferHumanity",
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
          applyAction(
            "transfer",
            buildTransferSuccessPatch({
              previousLastTransferTimestamp: base.lastTransferTimestamp,
            }),
          );
          toast.success("Transfer initiated!");
          setIdle();
          setIsTransferModalOpen(false);
        },
        onError(error) {
          toast.error(setWriteError(error));
        },
        onFail() {
          const message = "Transfer is not available right now.";
          setUnavailable(message);
          toast.error(message);
        },
      }),
      [
        applyAction,
        base.lastTransferTimestamp,
        setFeedbackState,
        setIdle,
        setUnavailable,
        setWriteError,
      ],
    ),
  );

  const hasTransferInFlight =
    transferStatus.write === "pending" ||
    (transferStatus.write === "success" &&
      transferStatus.transaction === "pending");

  const closeTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
    if (!hasTransferInFlight) {
      setIdle();
    }
  }, [hasTransferInFlight, setIdle]);

  const sectionState =
    pendingAction === "transfer"
      ? "pending"
      : !web3Loaded ||
          address?.toLowerCase() !== claimer.toLowerCase() ||
          homeChain.id !== chainId
        ? "hidden"
        : !!transferCooldownEndsAt && nowSeconds <= transferCooldownEndsAt
          ? "cooldown"
          : "action";

  if (sectionState === "hidden") {
    return null;
  }

  if (sectionState === "pending") {
    return (
      <div className="group relative">
        <button className="text-sky-500" disabled>
          Transfer
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          {WAITING_FOR_INDEXER_TOOLTIP}
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
        </span>
      </div>
    );
  }

  if (sectionState === "cooldown" && transferCooldownEndsAt) {
    return (
      <span className="text-secondaryText m-4 text-center sm:text-right">
        Transfer available <TimeAgo time={transferCooldownEndsAt} />
      </span>
    );
  }

  return (
    <>
      <div className="group relative">
        <button
          className="text-sky-500"
          disabled={isReconciling}
          onClick={() => setIsTransferModalOpen(true)}
        >
          Transfer
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
        open={isTransferModalOpen}
        onClose={closeTransferModal}
        canClose={!hasTransferInFlight && !isActionStateLoading(actionState)}
        header="Transfer"
      >
        <div className="p-4">
          <span className="txt text-primaryText m-2">
            Transfer your humanity to another chain. If you use a contract
            wallet make sure it has the same address on both chains.
          </span>
          {isActionStateLoading(actionState) ? (
            <div className="paper border-stroke bg-whiteBackground mt-4 px-3 py-2">
              <span className="text-secondaryText text-sm font-medium">
                {actionMessage}
              </span>
            </div>
          ) : null}
          {isActionStateError(actionState) ? (
            <div className="paper border-orange bg-lightOrange mt-4 px-3 py-2">
              <span className="text-orange text-sm font-medium">
                {actionMessage}
              </span>
            </div>
          ) : null}
          <div className="mt-4 flex justify-center">
            <ActionButton
              disabled={
                hasTransferInFlight || isActionStateLoading(actionState)
              }
              isLoading={
                hasTransferInFlight || isActionStateLoading(actionState)
              }
              label={hasTransferInFlight ? "Transferring..." : "Transfer"}
              onClick={() => {
                setIdle();

                prepareTransfer({
                  args: [gatewayId],
                });
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
