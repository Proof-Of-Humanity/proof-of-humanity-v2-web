"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import EvidenceFormFields from "components/EvidenceFormFields";
import RequestModal, { RequestModalHeader } from "components/RequestModal";
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { uploadEvidence } from "data/uploadEvidence";
import { useRequestOptimistic } from "optimistic/request";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticOverlay,
} from "optimistic/types";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Address, Hash } from "viem";
import { useAccount } from "wagmi";

const buildEvidenceSuccessItem = (
  uri: string,
  submitter: Address,
  name: string,
  description: string,
  fileURI?: string,
  txHash?: string,
): OptimisticEvidenceItem => ({
  id: `optimistic-evidence-${txHash ?? Date.now()}`,
  uri,
  creationTime: Math.floor(Date.now() / 1000),
  submitter,
  name,
  description,
  fileURI,
});

const buildEvidenceSuccessPatch = (
  uri: string,
  submitter: Address,
  name: string,
  description: string,
  fileURI?: string,
  txHash?: string,
): RequestOptimisticOverlay => ({
  evidenceList: [
    buildEvidenceSuccessItem(
      uri,
      submitter,
      name,
      description,
      fileURI,
      txHash,
    ),
  ],
});

interface AddEvidenceModalProps {
  open: boolean;
  onClose: () => void;
  pohId: Hash;
  requestIndex: number;
}

export default function AddEvidenceModal({
  open,
  onClose,
  pohId,
  requestIndex,
}: AddEvidenceModalProps) {
  const { pendingAction, applyAction } = useRequestOptimistic();
  const isReconciling = pendingAction !== null;
  const { address } = useAccount();
  const [pending, setPending] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const startLoading = useCallback((message?: string) => {
    setPending(true);
    setLoadingMessage(message);
  }, []);
  const stopLoading = useCallback(() => {
    setPending(false);
    setLoadingMessage(undefined);
  }, []);

  // Latest evidence metadata, read by the write `onSuccess` handler after the
  // tx resolves. A ref (not state) reads the current value without a stale
  // closure and keeps the tx-effects memo stable (no re-prepare per keystroke).
  const metaRef = useRef({ name: "", description: "", fileURI: "" });
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const showTitleError = titleTouched && !title.trim();

  const resetEvidenceState = useCallback(() => {
    metaRef.current = { name: "", description: "", fileURI: "" };
  }, []);

  const closeModal = useCallback(() => {
    onClose();
    setTitle("");
    setTitleTouched(false);
    setDescription("");
    setFile(null);
    resetEvidenceState();
    stopLoading();
  }, [onClose, resetEvidenceState, stopLoading]);

  const { uploadFile } = useAtlasProvider();
  const [prepare] = usePoHWrite(
    "submitEvidence",
    useMemo<Effects>(
      () => ({
        onReady(fire) {
          fire();
          startLoading("Transaction pending");
          toast.info("Transaction pending");
        },
        onFail() {
          resetEvidenceState();
          stopLoading();
          toast.error("Transaction failed");
        },
        onError() {
          resetEvidenceState();
          stopLoading();
          toast.error("Transaction rejected");
        },
        onSuccess(ctx) {
          const uri =
            typeof ctx.args?.[2] === "string" ? ctx.args[2] : undefined;
          if (address && uri) {
            applyAction(
              "evidence",
              buildEvidenceSuccessPatch(
                uri,
                address,
                metaRef.current.name,
                metaRef.current.description,
                metaRef.current.fileURI || undefined,
                ctx.txHash,
              ),
            );
          }
          toast.success("Evidence submitted successfully");
          closeModal();
        },
      }),
      [
        address,
        applyAction,
        closeModal,
        resetEvidenceState,
        startLoading,
        stopLoading,
      ],
    ),
  );

  const submit = async () => {
    startLoading("Uploading evidence...");

    try {
      const { evidenceUri, fileURI } = await uploadEvidence(uploadFile, {
        name: title,
        description,
        file,
      });

      metaRef.current = { name: title, description, fileURI: fileURI || "" };
      prepare({ args: [pohId, BigInt(requestIndex), evidenceUri] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload evidence.",
      );
      stopLoading();
    }
  };

  return (
    <RequestModal open={open} onClose={closeModal} canClose={!pending}>
      <RequestModalHeader
        title={
          <>
            Add <span className="text-peach">New Evidence</span>
          </>
        }
        description={
          <>
            <p>
              When someone challenges a profile, a case is opened in Kleros
              Court. A group of random jurors is selected to review the case.
              They look at the evidence from both sides and vote.
            </p>
            <p>
              The side with the most votes wins the dispute. Providing clear
              evidence is important. It helps the jurors understand the case and
              make a fair decision.
            </p>
          </>
        }
      />
      <EvidenceFormFields
        title={title}
        description={description}
        file={file}
        onTitleChange={setTitle}
        onTitleBlur={() => setTitleTouched(true)}
        onDescriptionChange={setDescription}
        onFileChange={setFile}
        disabled={pending}
        titleError={showTitleError}
      />
      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <AuthGuard
          signInButtonProps={{ className: "w-full sm:w-auto sm:min-w-[170px]" }}
        >
          <ActionButton
            disabled={
              pending || isReconciling || !title.trim() || !description.trim()
            }
            isLoading={pending}
            className="w-full sm:w-auto sm:min-w-[170px]"
            onClick={submit}
            label={loadingMessage || "Add Evidence"}
            tooltip={isReconciling ? "Waiting for indexer" : undefined}
          />
        </AuthGuard>
        <ActionButton
          className="w-full sm:w-auto sm:min-w-[170px]"
          label="Return"
          onClick={closeModal}
          disabled={pending}
          variant="secondary"
        />
      </div>
    </RequestModal>
  );
}
