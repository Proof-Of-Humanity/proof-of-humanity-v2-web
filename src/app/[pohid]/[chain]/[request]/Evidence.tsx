"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useObservable } from "@legendapp/state/react";
import Accordion from "components/Accordion";
import Attachment from "components/Attachment";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import Identicon from "components/Identicon";
import Label from "components/Label";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import Uploader from "components/Uploader";
import { explorerLink, idToChain } from "config/chains";
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { RequestQuery } from "generated/graphql";
import useChainParam from "hooks/useChainParam";
import useIPFS from "hooks/useIPFS";
import { useLoading } from "hooks/useLoading";
import DocumentIcon from "icons/NoteMajor.svg";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticOverlay,
} from "optimistic/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import ActionButton from "components/ActionButton";
import { EvidenceFile, MetaEvidenceFile } from "types/docs";
import { shortenAddress } from "utils/address";
import { ipfsFetch, ipfs } from "utils/ipfs";
import { romanize } from "utils/misc";
import { Address, Hash } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import AuthGuard from "components/AuthGuard";
import { useRequestOptimistic } from "optimistic/request";

enableReactUse();

export const buildEvidenceSuccessItem = (
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

export const buildEvidenceSuccessPatch = (
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

interface ItemInterface {
  index: number;
  item: OptimisticEvidenceItem;
  isPending?: boolean;
}

function Item({ index, item, isPending }: ItemInterface) {
  const chain = useChainParam()!;
  const [evidence] = useIPFS<EvidenceFile>(item.uri);
  const ipfsUri = evidence?.fileURI
    ? evidence?.fileURI
    : evidence?.evidence
      ? evidence?.evidence
      : item.fileURI;
  const title = evidence?.name || item.name;
  const description = evidence?.description || item.description;

  return (
    <div className={`mt-4 flex flex-col${isPending ? "opacity-70" : ""}`}>
      <div className="paper relative px-8 py-4">
        <span className="absolute left-3 text-sm text-slate-500">
          {romanize(index + 1)}
        </span>
        {isPending && (
          <span className="absolute right-3 top-2 animate-pulse text-xs font-medium text-orange-400">
            Pending
          </span>
        )}
        <div className="flex justify-between text-xl font-bold">
          {title}
          {ipfsUri && <Attachment uri={ipfsUri} />}
        </div>
        <p className="break-word break-words">{description}</p>
      </div>
      <div className="flex items-center px-4 py-2">
        <Identicon diameter={32} address={item.submitter} />
        <div className="text-primaryText flex flex-col pl-2">
          <span>
            submitted by{" "}
            <ExternalLink
              className="text-blue-500 underline underline-offset-2"
              href={explorerLink(item.submitter, chain)}
            >
              {shortenAddress(item.submitter)}
            </ExternalLink>
          </span>
          <TimeAgo time={item.creationTime} />
        </div>
      </div>
    </div>
  );
}

interface EvidenceProps {
  pohId: Hash;
  requestIndex: number;
  arbitrationInfo: NonNullable<RequestQuery["request"]>["arbitratorHistory"];
}

export default function Evidence({
  pohId,
  requestIndex,
  arbitrationInfo,
}: EvidenceProps) {
  const { effective, pendingAction, pendingEvidenceItem, applyAction } =
    useRequestOptimistic();
  const isReconciling = pendingAction !== null;
  const chainReq = useChainParam()!;
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: policy } = useSWR(
    arbitrationInfo.registrationMeta,
    async (metaEvidenceLink) =>
      (await ipfsFetch<MetaEvidenceFile>(metaEvidenceLink)).fileURI,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();
  const state$ = useObservable({
    uri: "",
    name: "",
    description: "",
    fileURI: "",
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTitle("");
    setDescription("");
    setFile(null);
    state$.uri.set("");
    state$.name.set("");
    state$.description.set("");
    state$.fileURI.set("");
    loading.stop();
  }, [loading, state$]);

  const { uploadFile } = useAtlasProvider();
  const [prepare] = usePoHWrite(
    "submitEvidence",
    useMemo<Effects>(
      () => ({
        onReady(fire) {
          fire();
          loading.start("Transaction pending");
          toast.info("Transaction pending");
        },
        onFail() {
          state$.uri.set("");
          state$.name.set("");
          state$.description.set("");
          state$.fileURI.set("");
          loading.stop();
          toast.error("Transaction failed");
        },
        onError() {
          state$.uri.set("");
          state$.name.set("");
          state$.description.set("");
          state$.fileURI.set("");
          loading.stop();
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
                state$.name.get(),
                state$.description.get(),
                state$.fileURI.get() || undefined,
                ctx.txHash,
              ),
            );
          }
          toast.success("Evidence submitted successfully");
          closeModal();
        },
      }),
      [address, applyAction, closeModal, loading],
    ),
  );

  const submit = async () => {
    state$.uri.set("");
    loading.start("Uploading evidence...");

    let evidenceFileURI;
    try {
      if (file) {
        evidenceFileURI = await uploadFile(file, Roles.Evidence);
        if (!evidenceFileURI) {
          toast.error("Failed to upload file.");
          loading.stop();
          return;
        }
      }

      const evidenceJson = {
        name: title,
        description: description,
        evidence: evidenceFileURI,
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

      state$.uri.set(evidenceUri);
      state$.name.set(title);
      state$.description.set(description);
      state$.fileURI.set(evidenceFileURI || "");
    } catch (error) {
      toast.error(`Failed to upload evidence : 
      ${error instanceof Error ? error.message : "Unknown error"}`);
      loading.stop();
    }
  };

  useEffect(() => {
    const unsubscribe = state$.onChange(({ value }) => {
      if (!value.uri) return;
      prepare({ args: [pohId, BigInt(requestIndex), value.uri] });
    });

    return () => unsubscribe();
  }, [pohId, prepare, requestIndex, state$]);

  const isEvidenceDisabled = chainReq.id !== chainId;

  return (
    <Accordion title="Evidence">
      {requestIndex >= 0 && (
        <>
          <div className="group relative mr-2 mt-4 self-end">
            <ActionButton
              disabled={isReconciling || isEvidenceDisabled}
              onClick={() => setModalOpen(true)}
              label="Add Evidence"
            />
            {(isReconciling || isEvidenceDisabled) && (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[240px] -translate-x-1/2 whitespace-normal rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                {isReconciling
                  ? "Syncing"
                  : `Switch your chain above to ${idToChain(chainReq.id)?.name || "the correct chain"}`}
                <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
              </span>
            )}
          </div>
          <Modal
            formal
            open={modalOpen}
            onClose={closeModal}
            canClose={!pending}
            header="Evidence"
          >
            <div className="bg-whiteBackground flex flex-col flex-wrap p-4">
              {policy && (
                <div className="centered text-primaryText flex-col">
                  <ExternalLink
                    className="flex flex-wrap gap-y-[8px] lg:gap-y-[0]"
                    href={ipfs(arbitrationInfo.registrationMeta)}
                  >
                    <DocumentIcon className="fill-orange h-6 w-6" />
                    <strong className="text-orange mr-1 font-semibold">
                      Registration Policy
                    </strong>
                    (at the time of submission)
                  </ExternalLink>
                  <span className="text-secondaryText text-sm">
                    Updated: <TimeAgo time={arbitrationInfo.updateTime} />
                  </span>
                </div>
              )}

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
                    ? file?.name
                    : "Drag 'n drop some files here, or click to select files"}
                </Uploader>
              </div>
              <AuthGuard signInButtonProps={{ className: "mt-12" }}>
                <ActionButton
                  disabled={pending || isReconciling}
                  isLoading={pending}
                  className="mt-12"
                  onClick={submit}
                  label={loadingMessage || "Submit"}
                  tooltip={isReconciling ? "Syncing" : undefined}
                />
              </AuthGuard>
            </div>
          </Modal>
        </>
      )}

      {effective.evidenceList.map((item, i) => (
        <Item key={item.id} index={i} item={item} isPending={false} />
      ))}
      {pendingAction === "evidence" && pendingEvidenceItem && (
        <Item
          key={pendingEvidenceItem.id}
          index={effective.evidenceList.length}
          item={pendingEvidenceItem}
          isPending
        />
      )}
    </Accordion>
  );
}
