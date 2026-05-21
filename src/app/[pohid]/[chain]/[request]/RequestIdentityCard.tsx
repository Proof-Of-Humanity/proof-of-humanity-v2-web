import Arrow from "components/Arrow";
import Attachment from "components/Attachment";
import ChainLogo from "components/ChainLogo";
import DocumentIcon from "components/DocumentIcon";
import ExternalLink from "components/ExternalLink";
import Identicon from "components/Identicon";
import Label from "components/Label";
import Previewed from "components/Previewed";
import TimeAgo from "components/TimeAgo";
import VideoThumbnail from "components/VideoThumbnail";
import { explorerLink } from "config/chains";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type {
  EvidenceFile,
  MetaEvidenceFile,
  RegistrationFile,
} from "types/docs";
import { prettifyId } from "utils/identifier";
import { ipfsFetch, safeIpfsUrl } from "utils/ipfs";
import type { Address } from "viem";
import type {
  RequestChain,
  RequestIdentityCardProps,
  RequestIdentityEvidence,
  RequestIdentityFiles,
  RequestIdentitySource,
  RequestPageRequest,
} from "./RequestIdentityCard.types";

/**
 * @notice Returns the original evidence URI from a request evidence list.
 * @dev Request evidence is fetched newest-first except winnerClaim, which only
 * requests the first registration evidence, so `at(-1)` works for both shapes.
 */
function getInitialEvidenceUri(evidence: RequestIdentityEvidence[]) {
  return evidence.at(-1)?.uri ?? null;
}

/**
 * @notice Starts the IPFS file requests needed by identity UI.
 * @dev Registration media comes from the identity source; revocation details
 * come from the current revocation request.
 */
function getIdentityFiles({
  identity,
  request,
}: {
  identity: RequestIdentitySource;
  request: RequestPageRequest;
}): RequestIdentityFiles {
  const registrationUri = getInitialEvidenceUri(
    identity.evidenceGroup.evidence,
  );
  const revocationUri = request.revocation
    ? getInitialEvidenceUri(request.evidenceGroup.evidence)
    : null;

  return {
    registrationFilePromise: registrationUri
      ? ipfsFetch<EvidenceFile>(registrationUri)
          .then((evidence) =>
            evidence?.fileURI
              ? ipfsFetch<RegistrationFile>(evidence.fileURI)
              : null,
          )
          .catch(() => null)
      : Promise.resolve(null),
    revocationFilePromise: revocationUri
      ? ipfsFetch<EvidenceFile>(revocationUri).catch(() => null)
      : Promise.resolve(null),
  };
}

/**
 * @notice Waits for identity data and renders the revocation evidence banner.
 * @dev Hidden for non-revocation requests or when the revocation evidence file
 * could not be loaded; callers wrap this component in Suspense.
 */
export async function RevocationBanner({
  chain,
  identityFiles,
  request,
}: {
  chain: RequestChain;
  identityFiles: RequestIdentityFiles;
  request: RequestPageRequest;
}) {
  const revocationFile = await identityFiles.revocationFilePromise;

  if (!request.revocation || !revocationFile) return null;

  return (
    <div className="bg-primaryBackground p-4">
      <div className="relative">
        <div className="text-primaryText flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
          Revocation requested - {revocationFile.name}
          {revocationFile.fileURI && (
            <Attachment uri={revocationFile.fileURI} />
          )}
        </div>
        <p className="text-primaryText text-center md:text-left">
          {revocationFile.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center text-center text-sm font-normal md:justify-start md:text-left">
        <span className="text-secondaryText mr-2">Requested by</span>
        <Identicon diameter={16} address={request.requester} />
        <ExternalLink
          className="ml-1 flex flex-wrap break-words break-all text-blue-500 underline underline-offset-2"
          href={explorerLink(request.requester, chain)}
        >
          {request.requester}
        </ExternalLink>
      </div>
    </div>
  );
}

/**
 * @notice Renders the profile media, name, and bio.
 * @dev Shared by desktop and mobile identity sections with layout-specific
 * spacing classes.
 */
function ProfileSummary({
  displayedClaimerName,
  registrationFile,
  bioClassName,
  nameClassName,
}: {
  displayedClaimerName: string;
  registrationFile: RegistrationFile | null;
  bioClassName: string;
  nameClassName: string;
}) {
  const photoUrl = safeIpfsUrl(registrationFile?.photo);

  return (
    <>
      {registrationFile && photoUrl && (
        <Previewed
          uri={photoUrl}
          trigger={
            <Image
              className="h-32 w-32 cursor-pointer rounded-full object-cover md:bg-cover md:bg-center md:bg-no-repeat"
              alt="image"
              src={photoUrl}
              width={144}
              height={144}
              unoptimized={true} //Skips cache
            />
          }
        />
      )}
      <span className={nameClassName}>{displayedClaimerName}</span>
      <span className={bioClassName}>{registrationFile?.bio || ""}</span>
    </>
  );
}

/**
 * @notice Waits for identity data and renders the desktop identity sidebar.
 * @dev Kept separate from the main card body so request info and timeline are
 * not blocked by profile-media fetching.
 */
export async function DesktopProfileAside({
  identity,
  identityFiles,
  request,
}: {
  identity: RequestIdentitySource;
  identityFiles: RequestIdentityFiles;
  request: RequestPageRequest;
}) {
  const registrationFile = await identityFiles.registrationFilePromise;
  const displayedClaimerName =
    registrationFile?.name || identity.claimer.name || "";

  return (
    <div className="background border-stroke hidden w-2/5 flex-col items-stretch justify-between border-r px-8 pt-8 md:flex">
      <div className="flex flex-col items-center">
        <ProfileSummary
          displayedClaimerName={displayedClaimerName}
          registrationFile={registrationFile}
          nameClassName="text-primaryText mb-12 mt-4 text-2xl"
          bioClassName="text-secondaryText text-sm font-light"
        />
      </div>

      <Label className="text-orange mb-8">
        Last update: <TimeAgo time={Number(request.lastStatusChange)} />
      </Label>
    </div>
  );
}

/**
 * @notice Waits for identity data and renders the request identity header.
 * @dev Allows non-identity sections below the header to stream independently.
 */
export async function IdentityHeader({
  chain,
  identity,
}: {
  chain: RequestChain;
  identity: RequestIdentitySource;
}) {
  const displayedClaimerId = identity.claimer.id as Address;

  return (
    <div className="mb-8 flex flex-col-reverse items-center justify-between md:flex-row md:items-stretch">
      <div className="flex w-full flex-col items-center md:w-auto md:flex-row md:items-center md:justify-start">
        <Identicon diameter={24} address={displayedClaimerId} />
        <ExternalLink
          className="text-secondaryText hover:text-primaryText mt-1 text-center font-semibold md:ml-2 md:mt-0 md:text-left"
          href={explorerLink(displayedClaimerId, chain)}
        >
          {displayedClaimerId.slice(0, 20)}
          <wbr />
          {displayedClaimerId.slice(20)}
        </ExternalLink>
      </div>
      <span className="text-primaryText mb-2 flex items-center justify-center md:mb-0 md:justify-start">
        <ChainLogo
          chainId={chain.id}
          className="fill-primaryText m-1 h-4 w-4"
        />
        {chain.name}
      </span>
    </div>
  );
}

/**
 * @notice Fetches meta-evidence and renders the request policy link.
 * @dev Returns null when the meta-evidence file is unavailable or has no file
 * URI, allowing the rest of the identity card to stream without this request.
 */
export async function PolicyLink({
  metaEvidenceUri,
}: {
  metaEvidenceUri: string;
}) {
  try {
    const policyLink = (await ipfsFetch<MetaEvidenceFile>(metaEvidenceUri))
      .fileURI;

    if (!policyLink) return null;
    const href = `/attachment?url=${encodeURIComponent(policyLink)}`;

    return (
      <div className="flex w-full flex-col items-center font-normal md:flex-row md:items-end md:justify-end">
        <Link
          href={href}
          className="text-primaryText ml-0 flex items-center justify-center md:ml-2"
        >
          <DocumentIcon className="fill-orange h-6 w-6" />
          <div className="text-primaryText group relative flex py-[8px]">
            Relevant Policy
          </div>
        </Link>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * @notice Renders the policy link and vouch slots below the registration video.
 * @dev Keeps caller-provided vouch UI composed into the identity card.
 */
export function RequestRelatedActions({
  policyMetaEvidenceUri,
  vouchedFor,
  vouchers,
}: {
  policyMetaEvidenceUri: string;
  vouchedFor: ReactNode;
  vouchers: ReactNode;
}) {
  return (
    <>
      <div className="flex w-full flex-wrap justify-center gap-2 md:flex-row md:items-center md:justify-between">
        <Suspense fallback={null}>
          <PolicyLink metaEvidenceUri={policyMetaEvidenceUri} />
        </Suspense>
        {vouchedFor}
      </div>
      <div className="flex w-full flex-wrap justify-center gap-2 md:flex-row md:items-center md:justify-between">
        {vouchers}
      </div>
    </>
  );
}

/**
 * @notice Waits for identity data and renders mobile profile media and video.
 * @dev Desktop profile media is handled by `DesktopProfileAside`.
 */
export async function MobileIdentityMedia({
  identity,
  identityFiles,
}: {
  identity: RequestIdentitySource;
  identityFiles: RequestIdentityFiles;
}) {
  const registrationFile = await identityFiles.registrationFilePromise;
  const displayedClaimerName =
    registrationFile?.name || identity.claimer.name || "";
  const videoUrl = safeIpfsUrl(registrationFile?.video);

  return (
    <>
      <div className="flex flex-col items-center md:hidden">
        <ProfileSummary
          displayedClaimerName={displayedClaimerName}
          registrationFile={registrationFile}
          nameClassName="text-primaryText mb-[16px] mt-4 text-2xl"
          bioClassName="text-secondaryText mb-[32px] text-sm font-light"
        />
      </div>
      {registrationFile && videoUrl && (
        <>
          <Previewed
            isVideo
            openVideoInNewTabOnError
            uri={videoUrl}
            trigger={
              <VideoThumbnail
                className="w-full cursor-pointer rounded-2xl"
                src={ipfs(registrationFile.video)}
              />
            }
          />
          <span className="text-secondaryText mt-1 text-center text-sm md:text-left">
            Tap video to preview fullscreen
          </span>
        </>
      )}
    </>
  );
}

/**
 * @notice Renders the identity/profile section for a request page.
 * @dev The component owns identity display UI, while callers pass request-page
 * slots for request info, vouches, and timeline content.
 */
export default function RequestIdentityCard({
  chain,
  identity,
  policyMetaEvidenceUri,
  pohId,
  request,
  requestInfo,
  timeline,
  vouchedFor,
  vouchers,
}: RequestIdentityCardProps) {
  const identityFiles = getIdentityFiles({
    identity,
    request,
  });
  const prettyPohId = prettifyId(pohId);

  return (
    <div className="border-stroke bg-whiteBackground mb-1 rounded-card border shadow-soft-inset">
      <Suspense fallback={null}>
        <RevocationBanner
          chain={chain}
          identityFiles={identityFiles}
          request={request}
        />
      </Suspense>

      <div className="flex flex-col md:flex-row">
        <Suspense
          fallback={
            <div className="background border-stroke hidden w-2/5 border-r md:flex" />
          }
        >
          <DesktopProfileAside
            identity={identity}
            identityFiles={identityFiles}
            request={request}
          />
        </Suspense>

        <div className="flex w-full flex-col p-[24px] lg:p-[32px]">
          <Suspense fallback={<div className="mb-8 h-8" />}>
            <IdentityHeader chain={chain} identity={identity} />
          </Suspense>
          <div className="mb-4 h-1 w-full border-b"></div>
          {requestInfo}
          <div className="text-orange mb-8 flex flex-wrap justify-center gap-x-[8px] gap-y-[8px] font-medium md:justify-start">
            <Link
              className="text-orange flex flex-row flex-wrap justify-center gap-x-[8px] text-center font-semibold hover:text-orange-500 md:justify-start"
              href={`/${prettyPohId}`}
            >
              <Image
                alt="poh id"
                src="/logo/pohid.svg"
                height={24}
                width={24}
              />
              {prettyPohId.slice(0, 20)}
              <wbr />
              {prettyPohId.slice(20)} <span>- Open ID</span> <Arrow />
            </Link>
          </div>
          <Suspense fallback={null}>
            <MobileIdentityMedia
              identity={identity}
              identityFiles={identityFiles}
            />
          </Suspense>
          <RequestRelatedActions
            policyMetaEvidenceUri={policyMetaEvidenceUri}
            vouchedFor={vouchedFor}
            vouchers={vouchers}
          />
          {timeline}
          <Label className="text-orange mb-8 text-center md:hidden">
            Last update: <TimeAgo time={request.lastStatusChange} />
          </Label>
        </div>
      </div>
    </div>
  );
}
