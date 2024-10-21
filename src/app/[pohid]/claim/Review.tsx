import Field from 'components/Field';
import Label from 'components/Label';
import TimeAgo from 'components/TimeAgo';
import { ipfs } from 'utils/ipfs';
import { formatEth } from 'utils/misc';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { ObservableObject, ObservablePrimitiveBaseFns } from '@legendapp/state';
import { MediaState, SubmissionState } from './Form';
import { formatEther } from 'viem';
import { SupportedChainId, idToChain } from 'config/chains';
import ExternalLink from 'components/ExternalLink';
import Image from 'next/image';
import Previewed from 'components/Previewed';
import DocumentIcon from 'icons/NoteMajor.svg';
import { ContractData } from 'data/contract';
import { prettifyId } from 'utils/identifier';

interface ReviewProps {
  arbitrationInfo: ContractData['arbitrationInfo'];
  totalCost: bigint;
  selfFunded$: ObservablePrimitiveBaseFns<number>;
  state$: ObservableObject<SubmissionState>;
  media$: ObservableObject<MediaState>;
  loadingMessage?: string;
  submit: () => void;
}

function Review({
  arbitrationInfo,
  totalCost,
  selfFunded$,
  state$,
  media$,
  loadingMessage,
  submit,
}: ReviewProps) {
  const selfFunded = selfFunded$.use();
  const { pohId, name } = state$.use();
  const { photo, video } = media$.use();
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;

  const { data: balance } = useBalance({ address, chainId });

  const { nativeCurrency } = idToChain(chainId)!;

  return (
    <>
      <span className="my-4 flex w-full flex-col text-2xl font-semibold">
        Finalize your registration
        <div className="divider mt-4 w-2/3" />
      </span>

      <div className="centered mb-4 flex-col">
        <ExternalLink
          className="text-orange mr-1 flex font-semibold"
          href={ipfs(arbitrationInfo.policy)}
        >
          <DocumentIcon className="fill-orange h-6 w-6" />
          Registration Policy
        </ExternalLink>
        <span className="text-secondaryText text-sm">
          Updated: <TimeAgo time={arbitrationInfo.updateTime} />
        </span>
      </div>

      <span className="txt pb-8">
        Before proceeding, check that your submission complies with the above Registration Policy.
        If not, you might lose your deposit. Specifically, make sure:
        <ul className="ml-8 list-disc">
          <li>
            Non-mirrored photo and video (if you display any text in the camera and it appears
            backwards, your image is mirrored).
          </li>
          <li>
            Photo is facing forward, without any covering that might hide internal facial features
            (no filters, heavy makeup, or masks).
          </li>
          <li>
            Video has good lighting and sound, your internal facial features are visible, and the
            displayed address is correct.
          </li>
        </ul>
      </span>

      <div className="mx-auto flex w-full flex-col items-center justify-center sm:flex-row">
        <Previewed
          uri={photo!.uri}
          trigger={
            <Image
              alt="preview"
              className="h-48 w-48 rounded-full"
              src={photo!.uri}
              width={256}
              height={256}
            />
          }
        />
        <Previewed
          isVideo
          uri={video!.uri}
          trigger={<video className="mt-4 h-48 cursor-pointer sm:ml-8 sm:mt-0" src={video!.uri} />}
        />
      </div>

      <div className="flex w-full flex-col">
        <Field label="Proof of Humanity ID" value={prettifyId(pohId)} disabled />
        <Field label="Name" value={name} disabled />
        <Field label="Account" value={address} disabled />

        <Label>
          <div className="flex items-center">
            Initial deposit
            {balance && (
              <span className="text-primaryText ml-8 normal-case">
                Your balance:{' '}
                <strong>
                  {formatEth(balance.value)} {nativeCurrency.symbol}
                </strong>
              </span>
            )}
          </div>
        </Label>
        <div className="txt mb-16 flex flex-col">
          <div className="inline-flex items-center">
            <div className="mr-2 w-48">
              <Field
                type="number"
                className="no-spinner text-right"
                step="any"
                min={0}
                max={formatEther(totalCost)}
                value={selfFunded}
                onChange={(event) => selfFunded$.set(+event.target.value)}
              />
            </div>
            of
            <span
              onClick={() => selfFunded$.set(formatEth(totalCost))}
              className="text-orange mx-1 cursor-pointer font-semibold underline underline-offset-2"
            >
              {formatEther(totalCost)}
            </span>{' '}
            {nativeCurrency.symbol}
          </div>

          <span className="mt-2 text-blue-500">
            The deposit is reimbursed after successful registration, and lost after failure. Any
            amount not contributed now can be put up by crowdfunders later.
          </span>
        </div>
      </div>
      {loadingMessage ? (
        <button className="btn-main">
          <Image
            alt="loading"
            src="/logo/poh-white.svg"
            className="animate-flip fill-white"
            width={14}
            height={14}
          />
          {loadingMessage}...
        </button>
      ) : (
        <button className="btn-main" onClick={submit}>
          Submit
        </button>
      )}
    </>
  );
}

export default Review;
