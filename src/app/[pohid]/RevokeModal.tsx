"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useAtlasProvider } from "@kleros/kleros-app";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { Hash } from "viem";

import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import ALink from "components/ExternalLink";
import Field from "components/Field";
import FileUploadZone from "components/FileUploadZone";
import Label from "components/Label";
import Modal from "components/Modal";
import type { SupportedChain } from "config/chains";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import type { ContractData } from "data/contract";
import { uploadEvidence } from "data/uploadEvidence";
import { getWriteErrorMessage } from "hooks/useActionFeedback";
import { useLoading } from "hooks/useLoading";
import DocumentIcon from "icons/NoteMajor.svg";
import { useProfileOptimistic } from "optimistic/profile";
import type { ProfileOptimisticOverlay } from "optimistic/types";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";

import RevokeConsequences from "./RevokeConsequences";

enableReactUse();

export const buildRevokeSuccessPatch = (): ProfileOptimisticOverlay => ({
  pendingRevocation: true,
});

interface RevokeModalProps {
  open: boolean;
  onClose: () => void;
  pohId: Hash;
  cost?: bigint;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
}

export default function RevokeModal({
  open,
  onClose,
  pohId,
  cost,
  homeChain,
  arbitrationInfo,
}: RevokeModalProps) {
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const loading = useLoading(false, "Revoke");
  const [pending, loadingMessage] = loading.use();
  const { applyAction } = useProfileOptimistic();
  const { uploadFile } = useAtlasProvider();

  const resetForm = useCallback(() => {
    setTitle("");
    setTitleTouched(false);
    setDescription("");
    setFile(null);
    loading.stop();
  }, [loading]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const [prepare, , writeStatus] = usePoHWrite(
    "revokeHumanity",
    useMemo(
      () => ({
        onReady(fire) {
          loading.stop();
          fire();
        },
        onFail() {
          toast.error("Revoke is not available right now.");
        },
        onError(error) {
          toast.error(getWriteErrorMessage(error));
        },
        onSuccess() {
          applyAction("revoke", buildRevokeSuccessPatch());
          toast.success("Request created");
          handleClose();
        },
      }),
      [applyAction, handleClose, loading],
    ),
  );

  const submit = async () => {
    if (cost === undefined) return;

    try {
      loading.start("Uploading evidence...");
      const { evidenceUri } = await uploadEvidence(uploadFile, {
        name: title,
        description,
        file,
      });
      prepare({ args: [pohId, evidenceUri], value: cost });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload evidence.",
      );
      loading.stop();
    }
  };

  const hasRevokeInFlight =
    writeStatus.write === "pending" ||
    (writeStatus.write === "success" && writeStatus.transaction === "pending");
  const isBusy = pending || hasRevokeInFlight;
  const showTitleError = titleTouched && !title.trim();

  return (
    <Modal
      formal
      className="w-[calc(100%-2rem)] max-w-[560px] md:w-[calc(100%-4rem)] xl:w-[560px]"
      open={open}
      onClose={handleClose}
      canClose={!isBusy}
    >
      <div className="flex max-h-[85vh] flex-col items-center gap-6 overflow-y-auto p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-primaryText text-2xl font-semibold">
            Revoke this humanity
          </h2>
          <p className="text-secondaryText text-sm">
            Request removal from the registry. Anyone can challenge it during
            the review window.
          </p>
          <ALink
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-peach"
            href={ipfs(arbitrationInfo.policy)}
          >
            <DocumentIcon className="h-4 w-4 fill-current" />
            Registry policy
          </ALink>
        </div>

        <RevokeConsequences
          deposit={
            cost !== undefined
              ? `${formatEth(cost)} ${homeChain.nativeCurrency.symbol}`
              : "—"
          }
        />

        <div className="border-stroke flex w-full flex-col gap-1 border-t pt-4">
          <Field
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            status={showTitleError ? "error" : undefined}
            message="A title is required"
          />
          <Field
            textarea
            label="Description (Your Arguments)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex w-full flex-col">
            <Label>File</Label>
            <FileUploadZone
              type="all"
              fileName={file?.name}
              onDrop={(acceptedFiles) => {
                const acceptedFile = acceptedFiles[0];
                if (acceptedFile) setFile(acceptedFile);
              }}
            />
          </div>
        </div>

        <AuthGuard signInButtonProps={{ className: "px-5 py-2" }}>
          <ActionButton
            disabled={cost === undefined || isBusy || !title.trim()}
            isLoading={isBusy}
            className="w-[170px]"
            onClick={submit}
            label={loadingMessage || "Revoke"}
          />
        </AuthGuard>
      </div>
    </Modal>
  );
}
