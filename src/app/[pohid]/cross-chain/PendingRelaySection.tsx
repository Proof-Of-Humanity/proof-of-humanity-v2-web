"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useChainId, useSwitchChain } from "wagmi";

import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import { idToChain, type SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts";
import useRelayWrite from "contracts/hooks/useRelayWrite";
import { useProfileOptimistic } from "optimistic/profile";
import {
  ACTION_STATES,
  isActionStateError,
  isActionStateLoading,
} from "../useActionFeedback";
import { RelayDataUnavailableError } from "../errors";
import useActionFeedback from "../useActionFeedback";
import { getChainPublicClient } from "./publicClient";
import {
  RELAY_MODE_MANUAL_SIGNATURES,
  RELAY_MODE_WAIT_ONLY,
  type RelayMode,
} from "./types";

const buildTransferRelaySuccessPatch = () => ({
  hasPendingTransferRelay: false,
});

const buildUpdateRelaySuccessPatch = () => ({
  hasPendingUpdateRelay: false,
});

type PendingRelaySectionProps = {
  mode: "transfer" | "update";
  relayMode: RelayMode;
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  encodedData?: `0x${string}`;
  transferTimestamp?: number;
};

export default function PendingRelaySection({
  mode,
  relayMode,
  sourceChainId,
  destinationChainId,
  encodedData,
  transferTimestamp,
}: PendingRelaySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { switchChain } = useSwitchChain();
  const chainId = useChainId() as SupportedChainId;
  const { effective, pendingAction, applyAction } = useProfileOptimistic();
  const sourceChainName = idToChain(sourceChainId)?.name;
  const destinationChainName = idToChain(destinationChainId)?.name;
  const isOnCorrectChain = chainId === destinationChainId;
  const relayPending =
    mode === "transfer"
      ? effective.hasPendingTransferRelay
      : effective.hasPendingUpdateRelay;
  const {
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();
  const relayAction = mode === "transfer" ? "relayTransfer" : "relayUpdate";
  const relayActionState =
    relayMode === RELAY_MODE_WAIT_ONLY
      ? "wait"
      : !isOnCorrectChain
        ? "switch-chain"
        : encodedData
          ? "manual-relay"
          : "wait";
  const [prepareRelayWrite, , relayStatus] = useRelayWrite(
    "executeSignatures",
    useMemo(
      () => ({
        onReady(fire: () => void) {
          setFeedbackState(ACTION_STATES.confirmWallet);
          fire();
        },
        onSuccess() {
          applyAction(
            relayAction,
            mode === "transfer"
              ? buildTransferRelaySuccessPatch()
              : buildUpdateRelaySuccessPatch(),
          );
          toast.success("Relay transaction sent!");
          setIdle();
          setIsModalOpen(false);
        },
        onLoading() {
          setFeedbackState(ACTION_STATES.txPending);
        },
        onError(error) {
          toast.error(setWriteError(error));
        },
        onFail() {
          const message = "Relay cannot be executed right now.";
          setUnavailable(message);
          toast.error(message);
        },
      }),
      [
        applyAction,
        mode,
        relayAction,
        setFeedbackState,
        setIdle,
        setUnavailable,
        setWriteError,
      ],
    ),
  );

  const hasRelayInFlight =
    relayStatus.write === "pending" ||
    (relayStatus.write === "success" && relayStatus.transaction === "pending");

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (!hasRelayInFlight) {
      setIdle();
    }
  }, [hasRelayInFlight, setIdle]);

  const handleExecuteRelay = async () => {
    if (!encodedData) {
      return;
    }

    setFeedbackState(ACTION_STATES.txPending, "Fetching relay approvals...");

    try {
      const publicClient = getChainPublicClient(sourceChainId);
      const signatures = (await publicClient.readContract({
        address: getContractInfo("GnosisAMBHelper", sourceChainId)
          .address as `0x${string}`,
        abi: getContractInfo("GnosisAMBHelper", sourceChainId).abi,
        functionName: "getSignatures",
        args: [encodedData],
      })) as `0x${string}`;

      prepareRelayWrite({
        args: [encodedData, signatures],
      });
    } catch (error) {
      const message =
        error instanceof RelayDataUnavailableError
          ? error.message
          : "Relay approvals are not ready yet. Wait a bit and try again.";
      setUnavailable(message);
      toast.info(message);
    }
  };

  const waitMessage =
    relayMode === RELAY_MODE_WAIT_ONLY
      ? mode === "transfer"
        ? "This transfer relay is handled automatically by the bridge."
        : "This state update relay is handled automatically by the bridge."
      : !encodedData
        ? "Relay details are still loading. Check back in a moment."
        : "Relay approvals are not ready yet. Wait a bit and try again.";

  if (!relayPending) {
    return (
      <span className="text-secondaryText m-4 font-semibold">
        {pendingAction === relayAction
          ? "Relay submitted. Waiting for indexed state."
          : "Relay complete."}
      </span>
    );
  }

  return (
    <>
      <button
        className="m-4 border-2 border-blue-500 p-2 font-bold text-blue-500"
        onClick={() => setIsModalOpen(true)}
      >
        ⏳ Pending relay
      </button>
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        canClose={!hasRelayInFlight && !isActionStateLoading(actionState)}
        header={mode === "transfer" ? "Last transfer" : "Pending state update"}
      >
        <div className="paper flex flex-col p-4">
          <div className="paper border-stroke bg-whiteBackground mb-4 p-3">
            <div className="text-secondaryText text-xs font-semibold uppercase tracking-[0.08em]">
              Relay route
            </div>
            <div className="text-primaryText mt-2 text-sm font-medium">
              {sourceChainName} ▶ {destinationChainName}
            </div>
            <div className="text-secondaryText mt-1 text-sm">
              Mode:{" "}
              {relayMode === RELAY_MODE_WAIT_ONLY
                ? "Automatic bridge relay"
                : "Manual relay with signatures"}
            </div>
          </div>
          {mode === "transfer" && transferTimestamp ? (
            <TimeAgo time={transferTimestamp} />
          ) : (
            <span className="txt text-secondaryText m-2">
              There is a pending state update that needs to be relayed on{" "}
              {destinationChainName}.
            </span>
          )}
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

          {relayActionState === "switch-chain" ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="paper border-orange p-3">
                <span className="txt text-orange">
                  ⚠️ Please switch to <strong>{destinationChainName}</strong> to
                  execute the relay
                </span>
              </div>
              <button
                className="btn-main"
                onClick={() => switchChain({ chainId: destinationChainId })}
              >
                Switch to {destinationChainName}
              </button>
            </div>
          ) : relayActionState === "manual-relay" &&
            relayMode === RELAY_MODE_MANUAL_SIGNATURES &&
            encodedData ? (
            <button
              className="btn-main mt-4"
              disabled={isActionStateLoading(actionState) || hasRelayInFlight}
              onClick={handleExecuteRelay}
            >
              {isActionStateLoading(actionState) || hasRelayInFlight
                ? "Processing..."
                : mode === "transfer"
                  ? "Relay Transferring Profile"
                  : "Execute relay"}
            </button>
          ) : (
            <div className="paper mt-4 p-4">
              <span className="txt text-secondaryText">{waitMessage}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
