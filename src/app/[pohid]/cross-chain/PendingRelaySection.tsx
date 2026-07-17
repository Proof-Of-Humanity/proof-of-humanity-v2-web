"use client";

import { useAppKit } from "@reown/appkit/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import ActionButton from "components/ActionButton";
import ChainLogo from "components/ChainLogo";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import { idToChain, type SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts";
import useRelayWrite from "contracts/hooks/useRelayWrite";
import useActionFeedback, {
  ACTION_STATES,
  isActionStateLoading,
} from "hooks/useActionFeedback";
import { useProfileOptimistic } from "optimistic/profile";
import { RelayDataUnavailableError } from "../errors";
import { getChainPublicClient } from "./publicClient";
import {
  RELAY_MODE_MANUAL_SIGNATURES,
  RELAY_MODE_WAIT_ONLY,
  type RelayMode,
} from "./types";
import {
  CROSS_CHAIN_MODAL_CLASS,
  CrossChainActionTrigger,
  CrossChainModalHeading,
} from "./crossChainUi";
import CheckCircleIcon from "icons/CheckCircleOutline.svg";
import HourglassIcon from "icons/Hourglass.svg";

function ChainChip({ chainId }: { chainId: SupportedChainId }) {
  return (
    <span className="border-stroke bg-whiteBackground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
      <ChainLogo chainId={chainId} className="fill-primaryText h-6 w-6" />
    </span>
  );
}

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
  const modal = useAppKit();
  const { isConnected } = useAccount();
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
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();
  const relayAction = mode === "transfer" ? "relayTransfer" : "relayUpdate";
  const relayActionState =
    relayMode === RELAY_MODE_WAIT_ONLY
      ? "wait"
      : !isConnected
        ? "connect-wallet"
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
        onError(error, errorCtx) {
          toast.error(setWriteError(error, errorCtx));
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

  const openConnectWallet = useCallback(() => {
    setIsModalOpen(false);
    window.setTimeout(() => {
      modal.open({ view: "Connect" });
    }, 0);
  }, [modal]);

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

  const busy = isActionStateLoading(actionState) || hasRelayInFlight;
  const destStatus = busy
    ? { label: "Executing…", tone: "text-peach" }
    : relayActionState === "wait"
      ? relayMode === RELAY_MODE_WAIT_ONLY
        ? { label: "Automatic", tone: "text-status-registered" }
        : { label: "Preparing…", tone: "text-secondaryText" }
      : { label: "Your turn", tone: "text-peach" };

  if (!relayPending) {
    const isIndexing = pendingAction === relayAction;
    return (
      <div className="flex basis-full items-center justify-center gap-2 text-sm">
        {isIndexing ? (
          <>
            <HourglassIcon className="h-4 w-4 shrink-0 animate-pulse text-peach" />
            <span className="text-secondaryText">
              Relay submitted · waiting for indexer
            </span>
          </>
        ) : (
          <>
            <CheckCircleIcon className="text-status-registered h-4 w-4 shrink-0" />
            <span className="text-status-registered">Relay complete</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <CrossChainActionTrigger
        label="Pending relay"
        icon={HourglassIcon}
        iconClassName="animate-pulse"
        onClick={() => setIsModalOpen(true)}
        className="basis-full text-center"
      />
      <Modal
        formal
        className={CROSS_CHAIN_MODAL_CLASS}
        open={isModalOpen}
        onClose={closeModal}
        canClose={!busy}
      >
        <div className="flex flex-col items-center gap-8 p-8 text-center">
          <CrossChainModalHeading
            title={
              mode === "transfer" ? "Transfer relay" : "State update relay"
            }
            description={
              mode === "transfer"
                ? "Your profile is bridging to another chain."
                : "Your state update is bridging to another chain."
            }
          />

          <div className="flex w-full flex-col gap-5">
            <div className="flex w-full items-center gap-3">
              <ChainChip chainId={sourceChainId} />
              <span className="bg-status-registered h-0.5 flex-1 rounded" />
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-peach" />
              <span className="h-0 flex-1 border-t border-dashed border-peach" />
              <ChainChip chainId={destinationChainId} />
            </div>

            <div className="flex w-full flex-col gap-2 text-left text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="text-status-registered h-4 w-4 shrink-0" />
                <span className="text-primaryText">
                  Submitted on {sourceChainName}
                </span>
                <span className="text-status-registered ml-auto text-xs">
                  Done
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HourglassIcon className="h-4 w-4 shrink-0 animate-pulse text-peach" />
                <span className="text-primaryText">
                  Awaiting execution on {destinationChainName}
                </span>
                <span className={`ml-auto text-xs ${destStatus.tone}`}>
                  {destStatus.label}
                </span>
              </div>
            </div>

            {mode === "transfer" && transferTimestamp ? (
              <span className="text-secondaryText text-xs">
                Started <TimeAgo time={transferTimestamp} />
              </span>
            ) : null}
          </div>

          {relayActionState === "connect-wallet" ? (
            <ActionButton
              className="w-[170px] whitespace-nowrap"
              label="Connect wallet"
              onClick={openConnectWallet}
            />
          ) : relayActionState === "switch-chain" ? (
            <ActionButton
              className="min-w-[170px] whitespace-nowrap"
              label={`Switch to ${destinationChainName}`}
              onClick={() => switchChain({ chainId: destinationChainId })}
            />
          ) : relayActionState === "manual-relay" &&
            relayMode === RELAY_MODE_MANUAL_SIGNATURES &&
            encodedData ? (
            <ActionButton
              className="w-[170px] whitespace-nowrap"
              disabled={busy}
              isLoading={busy}
              label={busy ? "Relaying…" : "Execute relay"}
              onClick={handleExecuteRelay}
            />
          ) : (
            <div className="border-stroke bg-whiteBackground flex w-full items-center justify-center gap-2 rounded-btn border px-4 py-3">
              <HourglassIcon className="text-secondaryText h-4 w-4 shrink-0 animate-pulse" />
              <span className="text-secondaryText text-sm">{waitMessage}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
