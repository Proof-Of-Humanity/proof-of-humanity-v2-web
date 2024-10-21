'use client';

import { SupportedChainId, idToChain } from 'config/chains';
import { colorForStatus } from 'config/misc';
import { queryToStatus } from 'config/requests';
import Link from 'next/link';
import { Suspense } from 'react';
import { Address, Hash } from 'viem';
import ChainLogo from 'components/ChainLogo';
import ErrorBoundary from 'components/ErrorBoundary';
import { WinnerClaimFragment } from 'generated/graphql';
import useIPFS from 'hooks/useIPFS';
import { EvidenceFile, RegistrationFile } from 'types/docs';
import { shortenAddress } from 'utils/address';
import { camelToTitle } from 'utils/case';
import { prettifyId } from 'utils/identifier';
import { ipfs } from 'utils/ipfs';
import { RequestsQueryItem } from './Grid';

interface ContentProps {
  chainId: SupportedChainId;
  revocation: boolean;
  registrationEvidenceRevokedReq: string;
  evidence: RequestsQueryItem['evidenceGroup']['evidence'];
  claimer: RequestsQueryItem['claimer'];
  requester: Address;
  humanity: { id: Hash } & WinnerClaimFragment;
  expired: boolean;
}

interface CardInterface extends ContentProps {
  index: number;
  status: string;
}

const LoadingFallback: React.FC = () => (
  <div className="h-84 bg-whiteBackground flex flex-col items-center p-2">
    <div className="bg-grey mx-auto mb-2 h-32 w-32 animate-pulse rounded-full" />
    <div className="bg-grey h-4 w-1/2 animate-pulse rounded" />
  </div>
);

const ErrorFallback: React.FC<{ claimer?: { name?: string | null } }> = ({ claimer }) => (
  <div className="h-84 flex animate-pulse flex-col items-center bg-white p-2">
    <div className="mx-auto mb-2 h-32 w-32 rounded-full bg-slate-200" />
    <span className="font-semibold">{claimer?.name}</span>
    <span>Some error occurred...</span>
  </div>
);

const Content = ({
  chainId,
  revocation,
  registrationEvidenceRevokedReq,
  humanity,
  evidence,
  requester,
  claimer,
  expired,
}: ContentProps) => {
  const [evidenceURI] = useIPFS<EvidenceFile>(
    revocation
      ? !!registrationEvidenceRevokedReq
        ? registrationEvidenceRevokedReq
        : humanity.winnerClaim.at(0)?.evidenceGroup.evidence.at(-1)?.uri
      : evidence.at(-1)?.uri,
    { suspense: true },
  );
  const [data] = useIPFS<RegistrationFile>(evidenceURI?.fileURI, {
    suspense: true,
  });

  let name =
    data && claimer.name && data.name !== claimer.name
      ? `${data?.name} (aka ${claimer.name})`
      : claimer.name
        ? claimer.name
        : data && data.name
          ? data.name
          : '';

  return (
    <div className="bg-whiteBackground flex h-full flex-col items-center p-3">
      <div
        className={'h-32 w-32 rounded-full bg-cover bg-center bg-no-repeat'}
        style={{ backgroundImage: `url('${ipfs(data?.photo!)}')` }}
      />
      <span className="text-primaryText my-2 truncate font-semibold">{name}</span>
      <div className="grid grid-cols-3 items-center">
        <ChainLogo chainId={chainId} className="fill-primaryText h-4 w-4" />
        <span className="text-secondaryText">{shortenAddress(requester)}</span>
      </div>
    </div>
  );
};

function Card({
  status,
  revocation,
  registrationEvidenceRevokedReq,
  index,
  requester,
  chainId,
  claimer,
  evidence,
  humanity: { id: pohId, winnerClaim },
  expired,
}: CardInterface) {
  const statusTitle = queryToStatus(status, revocation, expired);
  const statusColor = colorForStatus(status, revocation, expired);

  const chain = idToChain(chainId)!;

  return (
    <Link
      href={`/${prettifyId(pohId)}/${chain.name.toLowerCase()}/${index}`}
      className="h-84 border-stroke bg-whiteBackground wiggle cursor-pointer flex-col overflow-hidden rounded border shadow-sm transition duration-150 ease-out hover:z-10 hover:scale-105 hover:shadow-xl"
    >
      <div className="justify-between font-light">
        <div className={`h-1 w-full bg-status-${statusColor}`} />
        <div className="centered p-2 font-medium">
          <span className={`text-status-${statusColor}`}>
            {status === 'resolved' && expired && !revocation
              ? 'Expired'
              : camelToTitle(statusTitle, revocation, expired)}
          </span>
          <span className={`dot ml-2 bg-status-${statusColor}`} />
        </div>
      </div>

      <ErrorBoundary
        fallback={<ErrorFallback claimer={claimer} />}
        resetSwitch={evidence.at(0)?.uri}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Content
            chainId={chainId}
            claimer={claimer}
            evidence={evidence}
            humanity={{ id: pohId, winnerClaim }}
            requester={requester}
            revocation={revocation}
            registrationEvidenceRevokedReq={registrationEvidenceRevokedReq}
            expired={expired}
          />
        </Suspense>
      </ErrorBoundary>
    </Link>
  );
}

export default Card;
