"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";

import ActionButton from "components/ActionButton";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import { SupportedChainId, type SupportedChain } from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";

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
  debugDisableExecution = false,
}: {
  claimer: `0x${string}`;
  homeChain: SupportedChain;
  gatewayId: `0x${string}`;
  transferCooldownEndsAt?: number;
  debugDisableExecution?: boolean;
}) {
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { base, pendingAction, applyAction } = useProfileOptimistic();
  const loading = useLoading();
  const web3Loaded = useWeb3Loaded();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isLoading, loadingMessage] = loading.use();
  const isReconciling = pendingAction !== null;
  const nowSeconds = Date.now() / 1000;
  const [prepareTransfer, , transferStatus] = useCCPoHWrite(
    "transferHumanity",
    useMemo(
      () => ({
        onLoading() {
          loading.start("Transaction pending...");
        },
        onReady(fire: () => void) {
          setTransferError(null);
          loading.start("Confirm in wallet...");
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
          loading.stop();
          setIsTransferModalOpen(false);
        },
        onError() {
          setTransferError("Transaction failed. Check your wallet and try again.");
          toast.error("Transaction failed");
          loading.stop();
        },
        onFail() {
          setTransferError(
            "Simulation failed. The transfer is not currently executable.",
          );
          toast.error("Simulation failed");
          loading.stop();
        },
      }),
      [applyAction, base.lastTransferTimestamp, loading],
    ),
  );

  const hasTransferInFlight =
    transferStatus.write === "pending" ||
    (transferStatus.write === "success" &&
      transferStatus.transaction === "pending");

  const closeTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
    if (!hasTransferInFlight) {
      loading.stop();
    }
  }, [hasTransferInFlight, loading]);

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
          Waiting for indexer
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
            Waiting for indexer
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          </span>
        ) : null}
      </div>
      <Modal
        formal
        open={isTransferModalOpen}
        onClose={closeTransferModal}
        canClose={!hasTransferInFlight}
        header="Transfer"
      >
        <div className="p-4">
          <span className="txt text-primaryText m-2">
            Transfer your humanity to another chain. If you use a contract
            wallet make sure it has the same address on both chains.
          </span>
          {isLoading ? (
            <div className="paper border-stroke bg-whiteBackground mt-4 px-3 py-2">
              <span className="text-secondaryText text-sm font-medium">
                {loadingMessage}
              </span>
            </div>
          ) : null}
          {transferError ? (
            <div className="paper border-orange bg-lightOrange mt-4 px-3 py-2">
              <span className="text-orange text-sm font-medium">
                {transferError}
              </span>
            </div>
          ) : null}
          <ActionButton
            className="mt-4"
            disabled={hasTransferInFlight}
            isLoading={hasTransferInFlight}
            label={hasTransferInFlight ? "Transfering..." : "Transfer"}
            onClick={() => {
              setTransferError(null);

              if (debugDisableExecution) {
                toast.info("Harness mode: transfer execution disabled");
                return;
              }

              prepareTransfer({
                args: [gatewayId],
              });
            }}
          />
        </div>
      </Modal>
    </>
  );
}
