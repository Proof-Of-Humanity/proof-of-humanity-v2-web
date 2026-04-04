"use client";

import { useAppKit } from "@reown/appkit/react";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import ALink from "components/ExternalLink";
import ActionButton from "components/ActionButton";
import Field from "components/Field";
import Label from "components/Label";
import Modal from "components/Modal";
import Uploader from "components/Uploader";
import { SupportedChain, SupportedChainId } from "config/chains";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import DocumentIcon from "icons/NoteMajor.svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";
import { Hash } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import AuthGuard from "components/AuthGuard";
import { useProfileOptimistic } from "optimistic/profile";
import type { ProfileOptimisticOverlay } from "optimistic/types";
import {
  ACTION_STATES,
  isActionStateLoading,
  WAITING_FOR_INDEXER_TOOLTIP,
} from "./useActionFeedback";
import useActionFeedback from "./useActionFeedback";

enableReactUse();

export const buildRevokeSuccessPatch = (): ProfileOptimisticOverlay => ({
  pendingRevocation: true,
});

interface RevokeProps {
  cost: bigint;
  pohId: Hash;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
}

export default function Revoke({
  pohId,
  cost,
  homeChain,
  arbitrationInfo,
}: RevokeProps) {
  const { effective, pendingAction, applyAction } = useProfileOptimistic();
  const isReconciling = pendingAction !== null;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const loading = useLoading(false, "Revoke");
  const [pending, loadingMessage] = loading.use();
  const modal = useAppKit();
  const { isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const web3Loaded = useWeb3Loaded();
  const { switchChain } = useSwitchChain();
  const {
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setUnavailable,
    setWriteError,
  } = useActionFeedback();

  const { uploadFile } = useAtlasProvider();
  const resetModalState = useCallback(() => {
    setTitle("");
    setDescription("");
    setFile(null);
    setIdle();
    loading.stop();
  }, [loading, setIdle]);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetModalState();
  }, [resetModalState]);

  const [prepare] = usePoHWrite(
    "revokeHumanity",
    useMemo(
      () => ({
        onReady(fire) {
          loading.stop();
          setFeedbackState(ACTION_STATES.confirmWallet);
          fire();
        },
        onLoading() {
          setFeedbackState(ACTION_STATES.txPending);
        },
        onFail() {
          const message = "Revoke is not available right now.";
          setUnavailable(message);
          toast.error(message);
        },
        onError(error) {
          toast.error(setWriteError(error));
        },
        onSuccess() {
          applyAction("revoke", buildRevokeSuccessPatch());
          setIdle();
          closeModal();
          toast.success("Request created");
        },
      }),
      [
        applyAction,
        closeModal,
        loading,
        setFeedbackState,
        setIdle,
        setUnavailable,
        setWriteError,
      ],
    ),
  );

  useEffect(() => {
    if (effective.pendingRevocation) {
      closeModal();
    }
  }, [closeModal, effective.pendingRevocation]);

  const submit = async () => {
    try {
      loading.start("Uploading evidence...");

      let fileURI;
      if (file) {
        fileURI = await uploadFile(file, Roles.Evidence);
        if (!fileURI) {
          toast.error("Failed to upload file.");
          loading.stop();
          return;
        }
      }

      const evidenceJson = {
        name: title,
        description: description,
        fileURI: fileURI,
      };

      const evidenceTextFile = new File(
        [JSON.stringify(evidenceJson)],
        "evidence",
        {
          type: "text/plain",
        },
      );

      const evidenceUri = await uploadFile(evidenceTextFile, Roles.Evidence);

      if (!evidenceUri) {
        toast.error("Failed to upload evidence.");
        loading.stop();
        return;
      }

      prepare({ args: [pohId, evidenceUri], value: cost });
    } catch (error) {
      toast.error(
        `Failed to upload evidence : ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      loading.stop();
    }
  };

  if (web3Loaded && !isConnected)
    return (
      <button
        onClick={() => modal.open({ view: "Connect" })}
        className="btn-sec mb-4"
      >
        Connect wallet
      </button>
    );

  if (web3Loaded && homeChain.id !== connectedChainId)
    return (
      <button
        onClick={() => switchChain?.({ chainId: homeChain.id })}
        className="btn-sec mb-4"
      >
        Connect to {homeChain.name} to revoke
      </button>
    );

  return (
    <div className="flex w-full flex-col items-center">
      {effective.pendingRevocation && (
        <span className="text-secondaryText mb-4">
          {pendingAction === "revoke"
            ? "Removal proposed. Waiting for indexed state."
            : "Removal proposed."}
        </span>
      )}
      {!effective.pendingRevocation ? (
        <ActionButton
          onClick={() => setModalOpen(true)}
          label="Revoke"
          className="mb-4"
          disabled={isReconciling}
          tooltip={isReconciling ? WAITING_FOR_INDEXER_TOOLTIP : undefined}
        />
      ) : null}
      <Modal
        formal
        open={modalOpen}
        onClose={closeModal}
        canClose={!pending && !isActionStateLoading(actionState)}
        header="Revoke"
      >
        <div className="flex flex-col items-center p-4">
          <ALink className="flex" href={ipfs(arbitrationInfo.policy)}>
            <DocumentIcon className="fill-orange h-6 w-6" />
            <strong className="text-orange mr-1 font-semibold">Policy</strong>
          </ALink>

          <span className="txt text-primaryText mt-8">
            In order to request removal you need to deposit
          </span>
          <span className="text-primaryText text-xl font-semibold">
            {formatEth(cost)} {homeChain.nativeCurrency.symbol}
          </span>

          <span className="text-primaryText m-4">
            Anyone can put a deposit claiming the removal to be incorrect. If no
            one does, the individual is removed from the list. If one does, a
            dispute is created.
          </span>

          <Field
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Field
            textarea
            label="Description (Your Arguments)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Label>File</Label>
          <div className="bordered w-full rounded-sm">
            <Uploader
              className="bg-whiteBackgroundWithOpacity text-primaryText flex w-full justify-center rounded-sm p-2 outline-dotted outline-white"
              type="all"
              onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}
            >
              {file
                ? file.name
                : "Drag 'n drop some files here, or click to select files"}
            </Uploader>
          </div>

          <AuthGuard signInButtonProps={{ className: "mt-12 px-5 py-2" }}>
            <ActionButton
              disabled={
                pending || isReconciling || isActionStateLoading(actionState)
              }
              isLoading={pending || isActionStateLoading(actionState)}
              className="mt-12"
              onClick={submit}
              label={loadingMessage || actionMessage || "Revoke"}
              tooltip={isReconciling ? WAITING_FOR_INDEXER_TOOLTIP : undefined}
            />
          </AuthGuard>
        </div>
      </Modal>
    </div>
  );
}
