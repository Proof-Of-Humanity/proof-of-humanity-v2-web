import { useState, useMemo } from 'react';
import ALink from 'components/ExternalLink';
import Field from 'components/Field';
import Label from 'components/Label';
import Modal from 'components/Modal';
import TimeAgo from 'components/TimeAgo';
import { useLoading } from 'hooks/useLoading';
import { ipfs, uploadToIPFS } from 'utils/ipfs';
import { formatEth } from 'utils/misc';
import cn from 'classnames';
import Image from 'next/image';
import { useObservable } from '@legendapp/state/react';
import usePoHWrite from 'contracts/hooks/usePoHWrite';
import { Hash } from 'viem';
import DocumentIcon from 'icons/NoteMajor.svg';
import { ObservablePrimitiveBaseFns } from '@legendapp/state';
import { ContractData } from 'data/contract';

type Reason = 'none' | 'incorrectSubmission' | 'identityTheft' | 'sybilAttack' | 'deceased';

const reasonToImage: Record<Reason, string> = {
  none: '',
  incorrectSubmission: '/reason/incorrect.png',
  identityTheft: '/reason/duplicate.png',
  sybilAttack: '/reason/dne.png',
  deceased: '/reason/deceased.png',
};

function reasonToIdx(reason: Reason) {
  switch (reason) {
    case 'none':
      return 0;
    case 'incorrectSubmission':
      return 1;
    case 'identityTheft':
      return 2;
    case 'sybilAttack':
      return 3;
    case 'deceased':
      return 4;
    default:
      return 0;
  }
}

interface ReasonCardInterface {
  text: string;
  reason: Reason;
  current: ObservablePrimitiveBaseFns<Reason>;
}

const ReasonCard: React.FC<ReasonCardInterface> = ({ text, reason, current }) => (
  <div
    className={cn(
      'cursor-pointer rounded-sm bg-slate-200 p-0.5 text-lg uppercase text-black',
      reason === current.get() ? 'gradient font-bold' : 'grayscale',
    )}
    onClick={() => current.set(reason)}
  >
    <div className="flex h-full flex-col rounded-sm bg-white p-4 text-center">
      <Image
        width={500}
        height={200}
        className="object-cover"
        alt={reason}
        src={reasonToImage[reason]}
      />
      {text}
    </div>
  </div>
);

interface ChallengeInterface {
  pohId: Hash;
  requestIndex: number;
  revocation: boolean;
  arbitrationCost: bigint;
  arbitrationInfo: ContractData['arbitrationInfo'];
}

export default function Challenge({
  pohId,
  requestIndex,
  revocation,
  arbitrationCost,
  arbitrationInfo,
}: ChallengeInterface) {
  const [prepare] = usePoHWrite(
    'challengeRequest',
    useMemo(
      () => ({
        onReady(fire) {
          fire();
        },
      }),
      [],
    ),
  );

  const reason$ = useObservable<Reason>('none');
  const reason = reason$.use();

  const [justification, setJustification] = useState('');

  const loading = useLoading();

  const submit = async () => {
    if (revocation === !reason && !justification) return;

    loading.start('Uploading evidence');

    const data = new FormData();
    data.append('###', 'evidence.json');
    data.append('name', 'Challenge Justification');
    if (justification) data.append('description', justification);

    prepare({
      value: arbitrationCost,
      args: [
        pohId,
        BigInt(requestIndex),
        reasonToIdx(revocation ? 'none' : reason),
        await uploadToIPFS(data),
      ],
    });

    loading.start('Executing transaction');
  };

  return (
    <Modal formal header="Challenge" trigger={<button className="btn-main">Challenge</button>}>
      <div className="flex flex-col flex-wrap items-center p-4">
        <ALink className="flex" href={ipfs(arbitrationInfo.policy)}>
          <DocumentIcon className="fill-theme h-6 w-6" />
          <strong className="text-orange mr-1 font-semibold">Registration Policy</strong>
          (at the time of submission)
        </ALink>
        <span className="text-sm text-slate-400">
          Updated: <TimeAgo time={arbitrationInfo.updateTime} />
        </span>

        {!revocation && (
          <>
            <Label>Select challenging reason</Label>
            <div className="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
              <ReasonCard
                reason="incorrectSubmission"
                text="Incorrect Submission"
                current={reason$}
              />
              <ReasonCard reason="identityTheft" text="Identity Theft" current={reason$} />
              <ReasonCard reason="sybilAttack" text="Sybil Attack" current={reason$} />
              <ReasonCard reason="deceased" text="Deceased" current={reason$} />
            </div>
          </>
        )}

        <Field
          textarea
          label="Justification"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
        />

        <div className="txt mt-4 text-lg">Deposit: {formatEth(arbitrationCost)} ETH</div>

        <button
          disabled={!revocation ? !justification || reason === 'none' : !justification}
          className="btn-main mt-12"
          onClick={submit}
        >
          Challenge request
        </button>
      </div>
    </Modal>
  );
}
