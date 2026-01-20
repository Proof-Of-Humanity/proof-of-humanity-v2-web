"use client";

import { SupportedChainId, idToChain } from "config/chains";
import Link from "next/link";
import { Suspense } from "react";
import { Address, Hash } from "viem";
import ChainLogo from "components/ChainLogo";
import ErrorBoundary from "components/ErrorBoundary";
import { WinnerClaimFragment } from "generated/graphql";
import useIPFS from "hooks/useIPFS";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { shortenAddress } from "utils/address";
import {getStatusLabel, getStatusColor, getStatusTooltip, RequestStatus} from "utils/status";
import { prettifyId } from "utils/identifier";
import { ipfs } from "utils/ipfs";
import { RequestsQueryItem } from "./Grid";
import InfoIcon from "icons/info.svg";

interface ContentProps {
  chainId: SupportedChainId;
  revocation: boolean;
  registrationEvidenceRevokedReq: string;
  evidence: RequestsQueryItem["evidenceGroup"]["evidence"];
  claimer: RequestsQueryItem["claimer"];
  requester: Address;
  humanity: { id: Hash } & WinnerClaimFragment;
}

interface CardInterface extends ContentProps {
  index: number;
  requestStatus: RequestStatus;
}

const LoadingFallback: React.FC = () => (
  <div className="h-84 bg-whiteBackground flex flex-col items-center p-2">
    <div className="bg-grey mx-auto mb-2 h-32 w-32 animate-pulse rounded-full" />
    <div className="bg-grey h-4 w-1/2 animate-pulse rounded" />
  </div>
);

const ErrorFallback: React.FC<{ claimer?: { name?: string | null } }> = ({
  claimer,
}) => (
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
          : "";

  return (
    <div className="flex h-full flex-col items-center p-3">
      <div
        className={"h-32 w-32 rounded-full bg-cover bg-center bg-no-repeat"}
        style={{ backgroundImage: `url('${ipfs(data?.photo!)}')` }}
      />
      <span className="text-primaryText my-2 truncate font-semibold">
        {name}
      </span>
      <div className="grid grid-cols-3 items-center">
        <ChainLogo chainId={chainId} className="fill-primaryText h-4 w-4" />
        <span className="text-secondaryText">{shortenAddress(requester)}</span>
      </div>
    </div>
  );
};

function Card({
  revocation,
  registrationEvidenceRevokedReq,
  index,
  requester,
  chainId,
  claimer,
  evidence,
  humanity: { id: pohId, winnerClaim },
  requestStatus,
}: CardInterface) {

  const statusColor = getStatusColor(requestStatus);
  const tooltip = getStatusTooltip(requestStatus);

  const chain = idToChain(chainId)!;
  return (
    <Link
      href={`/${prettifyId(pohId)}/${chain.name.toLowerCase()}/${index}`}
      className="h-84 border-stroke bg-whiteBackground wiggle cursor-pointer flex-col rounded border shadow-sm transition duration-150 ease-out hover:z-10 hover:scale-105 hover:shadow-xl"
    >
      <div className="justify-between font-light">
        <div className={`h-1 w-full bg-status-${statusColor} rounded-t`} />
        <div className="centered p-2 font-medium">
          <span className={`text-status-${statusColor}`}>
            {getStatusLabel(requestStatus)}
          </span>
          <div className="group relative ml-2 flex items-center">
            <InfoIcon className={`h-4 w-4 stroke-current stroke-2 text-status-${statusColor}`} />
            {tooltip && (
              <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white transition-opacity pointer-events-none whitespace-normal">
                {tooltip}
                <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-neutral-700" />
              </span>
            )}
          </div>
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
          />
        </Suspense>
      </ErrorBoundary>
    </Link>
  );
}

export default Card;
