"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useChainId, useSwitchChain } from "wagmi";

import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import { idToChain, type SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts";
import useRelayWrite from "contracts/hooks/useRelayWrite";
import { useLoading } from "hooks/useLoading";
import { useProfileOptimistic } from "optimistic/profile";
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
  debugDisableExecution?: boolean;
};

export default function PendingRelaySection({
  mode,
  relayMode,
  sourceChainId,
  destinationChainId,
  encodedData,
  transferTimestamp,
  debugDisableExecution = false,
}: PendingRelaySectionProps) {
  const loading = useLoading();
  const [isLoading, loadingMessage] = loading.use();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [relayError, setRelayError] = useState<string | null>(null);
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
        onLoading() {
          loading.start("Transaction pending...");
        },
        onReady(fire: () => void) {
          setRelayError(null);
          loading.start("Confirm in wallet...");
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
          loading.stop();
          setIsModalOpen(false);
        },
        onError() {
          setRelayError(
            "Relay transaction failed. Check your wallet and try again.",
          );
          toast.error("Transaction failed");
          loading.stop();
        },
        onFail() {
          setRelayError(
            "Relay is not ready yet. Wait for confirmations and try again.",
          );
          toast.error("Confirmation takes around 10 minutes. Come back later");
          loading.stop();
        },
      }),
      [applyAction, loading, mode, relayAction],
    ),
  );

  const hasRelayInFlight =
    relayStatus.write === "pending" ||
    (relayStatus.write === "success" && relayStatus.transaction === "pending");

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (!hasRelayInFlight) {
      loading.stop();
    }
  }, [hasRelayInFlight, loading]);

  const handleExecuteRelay = async () => {
    if (debugDisableExecution) {
      toast.info("Harness mode: relay execution disabled");
      return;
    }
    if (!encodedData) {
      return;
    }

    setRelayError(null);
    loading.start("Fetching signatures...");

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
    } catch {
      setRelayError(
        "Signatures are not available yet. Try again after more confirmations.",
      );
      toast.info("Confirmation takes around 10 minutes. Come back later");
      loading.stop();
    }
  };

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
        canClose={!hasRelayInFlight}
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
          {isLoading ? (
            <div className="paper border-stroke bg-whiteBackground mt-4 px-3 py-2">
              <span className="text-secondaryText text-sm font-medium">
                {loadingMessage}
              </span>
            </div>
          ) : null}
          {relayError ? (
            <div className="paper border-orange bg-lightOrange mt-4 px-3 py-2">
              <span className="text-orange text-sm font-medium">
                {relayError}
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
              disabled={isLoading}
              onClick={handleExecuteRelay}
            >
              {isLoading
                ? "Processing..."
                : mode === "transfer"
                  ? "Relay Transferring Profile"
                  : "Execute relay"}
            </button>
          ) : (
            <div className="paper mt-4 p-4">
              <span className="txt text-secondaryText">
                {mode === "transfer"
                  ? "Relaying the transferring profile in this chain can take around 30 minutes."
                  : "Relaying a state update from this chain can take around 30 minutes. The relay will be processed automatically by the bridge oracles."}
              </span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
