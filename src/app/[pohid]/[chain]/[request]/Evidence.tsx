'use client';

import { enableReactUse } from '@legendapp/state/config/enableReactUse';
import usePoHWrite from 'contracts/hooks/usePoHWrite';
import AttachmentIcon from 'icons/AttachmentMajor.svg';
import DocumentIcon from 'icons/NoteMajor.svg';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address, Hash } from 'viem';
import Accordion from 'components/Accordion';
import ExternalLink from 'components/ExternalLink';
import Field from 'components/Field';
import withClientConnected from 'components/HighOrder/withClientConnected';
import Identicon from 'components/Identicon';
import Label from 'components/Label';
import Modal from 'components/Modal';
import TimeAgo from 'components/TimeAgo';
import Uploader from 'components/Uploader';
import { RequestQuery } from 'generated/graphql';
import useChainParam from 'hooks/useChainParam';
import useIPFS from 'hooks/useIPFS';
import { useLoading } from 'hooks/useLoading';
import { EvidenceFile, MetaEvidenceFile } from 'types/docs';
import { shortenAddress } from 'utils/address';
import { explorerLink } from 'config/chains';
import { ipfs, ipfsFetch, uploadToIPFS } from 'utils/ipfs';
import { romanize } from 'utils/misc';
import { usePublicClient } from 'wagmi';

enableReactUse();

interface ItemInterface {
  index: number;
  uri: string;
  creationTime: number;
  sender: Address;
}

function Item({ index, uri, creationTime, sender }: ItemInterface) {
  const chain = useChainParam()!;
  const [evidence] = useIPFS<EvidenceFile>(uri);

  return (
    <div className="mt-4 flex flex-col">
      <div className="paper relative px-8 py-4">
        <span className="absolute left-3 text-sm text-slate-500">{romanize(index + 1)}</span>
        <div className="flex justify-between text-xl font-bold">
          {evidence?.name}
          {evidence?.fileURI && (
            <Link href={`/attachment?url=${encodeURIComponent(ipfs(evidence?.fileURI))}`}>
              <AttachmentIcon className="h-6 w-6 fill-black" />
            </Link>
          )}
        </div>
        <p className="break-word break-words">{evidence?.description}</p>
      </div>
      <div className="flex items-center px-4 py-2">
        <Identicon diameter={32} address={sender} />
        <div className="text-primaryText flex flex-col pl-2">
          <span>
            submitted by{' '}
            <ExternalLink
              className="text-blue-500 underline underline-offset-2"
              href={explorerLink(sender, chain)}
            >
              {shortenAddress(sender)}
            </ExternalLink>
          </span>
          <TimeAgo time={creationTime} />
        </div>
      </div>
    </div>
  );
}

interface EvidenceProps extends JSX.IntrinsicAttributes {
  pohId: Hash;
  requestIndex: number;
  arbitrationInfo: NonNullable<RequestQuery['request']>['arbitratorHistory'];
  list: NonNullable<RequestQuery['request']>['evidenceGroup']['evidence'];
}

export default withClientConnected<EvidenceProps>(function Evidence({
  pohId,
  requestIndex,
  list,
  arbitrationInfo,
}) {
  const chainReq = useChainParam()!;
  const { chain } = usePublicClient();
  const { data: policy } = useSWR(
    arbitrationInfo.registrationMeta,
    async (metaEvidenceLink) => (await ipfsFetch<MetaEvidenceFile>(metaEvidenceLink)).fileURI,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const loading = useLoading(false, 'Revoke');
  const [pending] = loading.use();

  const [prepare] = usePoHWrite(
    'submitEvidence',
    useMemo(
      () => ({
        onReady(fire) {
          fire();
          toast.info('Transaction pending');
        },
        onError() {
          loading.stop();
          toast.error('Transaction rejected');
        },
        onSuccess() {
          setModalOpen(false);
          toast.success('Request created');
        },
      }),
      [loading],
    ),
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const submit = async () => {
    loading.start();

    const data = new FormData();
    data.append('###', 'evidence.json');
    data.append('name', title);
    if (description) data.append('description', description);
    if (file) data.append('evidence', file, file.name);

    prepare({ args: [pohId, BigInt(requestIndex), await uploadToIPFS(data)] });

    loading.stop();
  };

  const [isEvidenceDisabled, setIsEvidenceDisabled] = useState(false);

  useEffect(() => {
    setIsEvidenceDisabled(chainReq.id !== chain.id);
  }, [chain]);

  return (
    <Accordion title="Evidence">
      {requestIndex >= 0 && (
        <Modal
          formal
          open={modalOpen}
          header="Evidence"
          trigger={
            <button
              disabled={isEvidenceDisabled}
              onClick={() => setModalOpen(true)}
              className="btn-main mx-2 mt-2 w-48 self-end"
            >
              Add evidence
            </button>
          }
        >
          <div className="bg-whiteBackground flex flex-col flex-wrap p-4">
            {policy && (
              <div className="centered text-primaryText flex-col">
                <ExternalLink
                  className="flex flex-wrap gap-y-[8px] lg:gap-y-[0]"
                  href={ipfs(arbitrationInfo.registrationMeta)}
                >
                  <DocumentIcon className="fill-orange h-6 w-6" />
                  <strong className="text-orange mr-1 font-semibold">Registration Policy</strong>
                  (at the time of submission)
                </ExternalLink>
                <span className="text-secondaryText text-sm">
                  Updated: <TimeAgo time={arbitrationInfo.updateTime} />
                </span>
              </div>
            )}

            <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                {file ? file?.name : "Drag 'n drop some files here, or click to select files"}
              </Uploader>
            </div>
            <button disabled={pending} className="btn-main mt-12" onClick={submit}>
              Submit
            </button>
          </div>
        </Modal>
      )}

      {list.map((item, i) => (
        <Item
          key={item.id}
          index={i}
          creationTime={item.creationTime}
          sender={item.submitter}
          uri={item.uri}
        />
      ))}
    </Accordion>
  );
});
