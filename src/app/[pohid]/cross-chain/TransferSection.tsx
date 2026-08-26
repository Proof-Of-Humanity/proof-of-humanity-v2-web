"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";

import ActionButton from "components/ActionButton";
import ChainLogo from "components/ChainLogo";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import {
  getForeignChain,
  supportedChains,
  SupportedChainId,
} from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import {
  getWriteErrorMessage,
  WAITING_FOR_INDEXER_TOOLTIP,
} from "hooks/useActionFeedback";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";
import TransferIcon from "icons/Transfer.svg";
import {
  CROSS_CHAIN_MODAL_CLASS,
  CrossChainActionTrigger,
  CrossChainModalHeading,
} from "./crossChainUi";

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
  homeChainId,
  gatewayId,
  transferCooldownEndsAt,
}: {
  claimer: `0x${string}`;
  homeChainId: SupportedChainId;
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
  const [prepareTransfer, , transferStatus] = useCCPoHWrite(
    "transferHumanity",
    useMemo(
      () => ({
        onReady(fire: () => void) {
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
          setIsTransferModalOpen(false);
        },
        onError(error, errorCtx) {
          toast.error(getWriteErrorMessage(error, errorCtx));
        },
        onFail() {
          toast.error("Transfer is not available right now.");
        },
      }),
      [applyAction, base.lastTransferTimestamp],
    ),
  );

  const hasTransferInFlight =
    transferStatus.write === "pending" ||
    (transferStatus.write === "success" &&
      transferStatus.transaction === "pending");
  const destinationChain = getForeignChain(homeChainId);

  const closeTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
  }, []);

  const sectionState =
    pendingAction === "transfer"
      ? "pending"
      : !web3Loaded ||
          address?.toLowerCase() !== claimer.toLowerCase() ||
          homeChainId !== chainId
        ? "hidden"
        : !!transferCooldownEndsAt && nowSeconds <= transferCooldownEndsAt
          ? "cooldown"
          : "action";

  if (sectionState === "hidden") {
    return null;
  }

  if (sectionState === "pending") {
    return (
      <CrossChainActionTrigger
        label="Transfer"
        icon={TransferIcon}
        disabled
        tooltip={WAITING_FOR_INDEXER_TOOLTIP}
      />
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
      <CrossChainActionTrigger
        label="Transfer"
        icon={TransferIcon}
        onClick={() => setIsTransferModalOpen(true)}
        disabled={isReconciling}
        tooltip={isReconciling ? WAITING_FOR_INDEXER_TOOLTIP : undefined}
      />
      <Modal
        className={CROSS_CHAIN_MODAL_CLASS}
        open={isTransferModalOpen}
        onClose={closeTransferModal}
        canClose={!hasTransferInFlight}
      >
        <div className="flex flex-col items-center gap-8 p-8 text-center">
          <CrossChainModalHeading title="Transfer your POH ID to another chain" />
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-primaryText text-sm">Select new chain below</p>
            <div className="bg-whiteBackground flex w-full flex-col items-center gap-4 rounded-btn py-4">
              <div className="flex flex-col items-start gap-4">
                {supportedChains.map((chain) => {
                  const isCurrent = chain.id === homeChainId;
                  return (
                    <label
                      className="text-primaryText flex items-center gap-4 whitespace-nowrap text-sm"
                      key={chain.id}
                    >
                      <input
                        checked={chain.id === destinationChain}
                        className="radio h-6 w-6 shrink-0"
                        disabled={isCurrent}
                        name="destination-chain"
                        readOnly
                        type="radio"
                      />
                      <span className="flex items-center gap-2">
                        <ChainLogo
                          chainId={chain.id}
                          className="h-6 w-6 shrink-0 fill-current"
                        />
                        {chain.name}
                        {isCurrent ? (
                          <span className="text-secondaryText">(current)</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <ActionButton
              className="w-fit min-w-[170px]"
              disabled={hasTransferInFlight}
              isLoading={hasTransferInFlight}
              label={hasTransferInFlight ? "Transferring..." : "Transfer"}
              onClick={() => prepareTransfer({ args: [gatewayId] })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
