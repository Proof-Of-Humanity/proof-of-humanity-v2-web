import { ChainId } from "enums/ChainId";
import React, { useState } from "react";
import useContractData from "api/useContractData";
import DocumentIcon from "assets/svg/NoteMajor.svg";
import ALink from "components/ALink";
import Field from "components/Field";
import Label from "components/Label";
import Modal from "components/Modal";
import Uploader from "components/Uploader";
import {
  useRequestTotalCost,
  useRevokeHumanity,
} from "hooks/useProofOfHumanity";
import useSwitchChain from "hooks/useSwitchChain";
import { machinifyId } from "utils/identifier";
import { ipfs, uploadToIPFS } from "utils/ipfs";
import { formatEth } from "utils/misc";

interface RevokeProps {
  humanity: string;
  homeChain: ChainId;
}

const Revoke: React.FC<RevokeProps> = ({ humanity, homeChain }) => {
  const totalCost = useRequestTotalCost();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const switchChain = useSwitchChain();
  const contractData = useContractData(homeChain);

  const revokeHumanity = useRevokeHumanity();

  if (!totalCost) return null;

  const submit = async () => {
    if (await switchChain(homeChain)) return;

    const data = new FormData();
    data.append("###", "evidence.json");
    data.append("name", title);
    data.append("description", description);
    if (file) data.append("fileURI", file, file.name);

    const evidenceUri = await uploadToIPFS(data);

    revokeHumanity(machinifyId(humanity), evidenceUri, { value: totalCost });
  };

  return (
    <Modal
      formal
      header="Revoke"
      trigger={<button className="btn-main">Revoke humanity</button>}
    >
      <div className="p-4 flex flex-col items-center">
        {contractData && contractData.contract && (
          <ALink
            className="flex"
            href={ipfs(
              contractData.contract.latestArbitratorData.registrationMeta
            )}
          >
            <DocumentIcon className="w-6 h-6 fill-theme" />
            <strong className="mr-1 text-theme font-semibold">
              Registration Policy
            </strong>
          </ALink>
        )}

        <span className="txt mt-8">
          In order to request removal you need to deposit
        </span>
        <span className="font-semibold text-xl">
          {formatEth(totalCost)} ETH
        </span>

        <span className="m-4">
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
            className="w-full flex justify-center bg-white p-2 outline-dotted outline-white rounded-sm"
            type="all"
            onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}
          >
            {file
              ? file.name
              : "Drag 'n drop some files here, or click to select files"}
          </Uploader>
        </div>

        <button className="btn-main mt-12" onClick={submit}>
          Revoke humanity
        </button>
      </div>
    </Modal>
  );
};

export default Revoke;
