"use client";

import cn from "classnames";
import { SupportedChainId, idToChain } from "config/chains";
import Link from "next/link";
import { Address, Hash } from "viem";
import ChainLogo from "components/ChainLogo";
import ErrorBoundary from "components/ErrorBoundary";
import LoadableImage from "components/LoadableImage";
import MediaFallback from "components/MediaFallback";
import { WinnerClaimFragment } from "generated/graphql";
import useIPFS from "hooks/useIPFS";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { shortenAddress } from "utils/address";
import { getStatusTooltip, RequestStatus } from "utils/status";
import { prettifyId } from "utils/identifier";
import { safeIpfsUrl } from "utils/ipfs";
import { getDisplayName } from "utils/name";
import { RequestsQueryItem } from "./Grid";
import StatusBadge from "./StatusBadge";
import InfoIcon from "icons/info.svg";
import type { PointerEvent } from "react";

interface ContentProps {
  chainId: SupportedChainId;
  revocation: boolean;
  registrationEvidenceRevokedReq: string;
  evidence: RequestsQueryItem["evidenceGroup"]["evidence"];
  claimer: RequestsQueryItem["claimer"];
  requester: Address;
  enableMediaParallax?: boolean;
  humanity: {
    id: Hash;
    registration?: { claimer: { id: Address } } | null;
  } & WinnerClaimFragment;
}

interface CardInterface extends ContentProps {
  index: number;
  requestStatus: RequestStatus;
  aspectRatio?: "wide" | "square";
}

const getEvidenceUri = ({
  evidence,
  humanity,
  registrationEvidenceRevokedReq,
  revocation,
}: Pick<
  ContentProps,
  "evidence" | "humanity" | "registrationEvidenceRevokedReq" | "revocation"
>) =>
  revocation
    ? registrationEvidenceRevokedReq ||
      humanity.winnerClaim.at(0)?.evidenceGroup.evidence.at(-1)?.uri
    : evidence.at(-1)?.uri;

const updateCardHoverParallax = (event: PointerEvent<HTMLAnchorElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * -18;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;

  event.currentTarget.style.setProperty(
    "--request-card-hover-x",
    `${x.toFixed(2)}px`,
  );
  event.currentTarget.style.setProperty(
    "--request-card-hover-y",
    `${y.toFixed(2)}px`,
  );
};

const resetCardHoverParallax = (event: PointerEvent<HTMLAnchorElement>) => {
  event.currentTarget.style.removeProperty("--request-card-hover-x");
  event.currentTarget.style.removeProperty("--request-card-hover-y");
};

const ErrorFallback: React.FC<{ claimer?: { name?: string | null } }> = ({
  claimer,
}) => (
  <>
    <div className="bg-grey absolute inset-0" />
    <div className="request-card-overlay absolute inset-0" />
    <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[21px]">
      <div className="truncate text-2xl font-semibold text-white">
        {claimer?.name || "Unavailable"}
      </div>
      <div className="mt-1 text-sm text-dark-secondaryText">
        Profile media could not be loaded
      </div>
    </div>
  </>
);

const Content = ({
  chainId,
  revocation,
  registrationEvidenceRevokedReq,
  humanity,
  evidence,
  requester,
  claimer,
  enableMediaParallax = false,
}: ContentProps) => {
  const evidenceUri = getEvidenceUri({
    evidence,
    humanity,
    registrationEvidenceRevokedReq,
    revocation,
  });
  const [evidenceFile, evidenceError] = useIPFS<EvidenceFile>(evidenceUri);
  const [data, dataError] = useIPFS<RegistrationFile>(evidenceFile?.fileURI);

  const name = getDisplayName(data, claimer.name);
  const displayedClaimerId =
    revocation && humanity.registration?.claimer.id
      ? humanity.registration.claimer.id
      : requester;

  const photo = safeIpfsUrl(data?.photo) ?? null;
  const isMediaLoading =
    Boolean(evidenceUri && !evidenceFile && !evidenceError) ||
    Boolean(evidenceFile?.fileURI && !data && !dataError);

  return (
    <>
      {photo ? (
        <LoadableImage
          alt={name || "Profile photo"}
          className={cn(
            "absolute w-full object-cover",
            enableMediaParallax
              ? "request-card-media"
              : "inset-0 h-full transition-transform duration-200 ease-premium group-hover:scale-105",
          )}
          fallbackLabel="Profile photo unavailable"
          src={photo}
        />
      ) : isMediaLoading ? (
        <MediaFallback className="absolute inset-0" />
      ) : (
        <div className="bg-grey absolute inset-0" />
      )}
      <div className="request-card-overlay absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[21px]">
        <div className="truncate text-2xl font-semibold text-white">
          {name || shortenAddress(displayedClaimerId)}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-dark-secondaryText">
          <ChainLogo chainId={chainId} className="h-4 w-4 fill-current" />
          {shortenAddress(displayedClaimerId)}
        </div>
      </div>
    </>
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
  humanity,
  requestStatus,
  aspectRatio = "square",
  enableMediaParallax = true,
}: CardInterface) {
  const pohId = humanity.id;
  const tooltip = getStatusTooltip(requestStatus);

  const chain = idToChain(chainId);

  if (!chain) return null;

  return (
    <Link
      href={`/${prettifyId(pohId)}/${chain.name.toLowerCase()}/${index}`}
      className={cn(
        "request-card-shell group relative block w-full cursor-pointer rounded-card border transition duration-200 ease-premium hover:z-10 hover:-translate-y-[3px]",
        aspectRatio === "square" ? "aspect-square" : "aspect-[5/4]",
        enableMediaParallax && "request-card-parallax",
      )}
      onPointerMove={enableMediaParallax ? updateCardHoverParallax : undefined}
      onPointerLeave={enableMediaParallax ? resetCardHoverParallax : undefined}
    >
      <div className="absolute inset-0 overflow-hidden rounded-card">
        <ErrorBoundary
          fallback={<ErrorFallback claimer={claimer} />}
          resetSwitch={evidence.at(0)?.uri}
        >
          <Content
            chainId={chainId}
            claimer={claimer}
            evidence={evidence}
            enableMediaParallax={enableMediaParallax}
            humanity={humanity}
            requester={requester}
            revocation={revocation}
            registrationEvidenceRevokedReq={registrationEvidenceRevokedReq}
          />
        </ErrorBoundary>
      </div>

      <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 px-4 pt-[9px] font-medium">
        <StatusBadge status={requestStatus} />
        <div className="group/info relative flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#2F333D]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
          <InfoIcon className="h-4 w-4 stroke-current stroke-2 text-white drop-shadow-md" />
          {tooltip && (
            <span className="request-card-tooltip tooltip-surface pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-max max-w-[200px] whitespace-normal text-center text-sm opacity-0 transition-opacity group-hover/info:opacity-100">
              {tooltip}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Card;
