import Attachment from "components/Attachment";
import DocumentIcon from "components/DocumentIcon";
import ExternalLink from "components/ExternalLink";
import Identicon from "components/Identicon";
import IdentityReferenceRow from "components/IdentityReferenceRow";
import Label from "components/Label";
import LoadableImage from "components/LoadableImage";
import MediaFallback from "components/MediaFallback";
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
          className="ml-1 flex flex-wrap break-words break-all text-peach underline underline-offset-2 hover:opacity-80"
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
            <LoadableImage
              className="h-32 w-32 cursor-pointer rounded-full object-cover md:bg-cover md:bg-center md:bg-no-repeat"
              alt="image"
              fallbackLabel="Profile photo unavailable"
              src={photoUrl}
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
  vouchedFor,
  vouchers,
}: {
  identity: RequestIdentitySource;
  identityFiles: RequestIdentityFiles;
  request: RequestPageRequest;
  vouchedFor: ReactNode;
  vouchers: ReactNode;
}) {
  const registrationFile = await identityFiles.registrationFilePromise;
  const displayedClaimerName =
    registrationFile?.name || identity.claimer.name || "";

  return (
    <div className="md:border-stroke contents md:flex md:w-[26%] md:min-w-[16rem] md:shrink-0 md:flex-col md:items-center md:border-r md:px-6 md:py-6">
      <div className="order-3 flex w-full flex-col items-center px-6 text-center md:order-none md:px-0">
        <ProfileSummary
          displayedClaimerName={displayedClaimerName}
          registrationFile={registrationFile}
          nameClassName="text-primaryText mt-2 text-2xl font-semibold"
          bioClassName="text-secondaryText mt-2 max-w-[18rem] text-sm font-normal leading-5"
        />
      </div>
      <div className="border-stroke order-7 mb-8 mt-8 flex w-[calc(100%-3rem)] flex-col items-center gap-4 self-center border-y py-4 md:order-none md:mb-0 md:w-full md:self-auto [&:not(:has(>*))]:hidden">
        {vouchers}
        {vouchedFor}
      </div>
      <Label className="text-secondaryText order-9 mb-10 mt-8 text-center text-xs font-normal md:order-none md:mb-0 md:mt-auto md:pt-8">
        Last update <TimeAgo time={Number(request.lastStatusChange)} />
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
  pohId,
}: {
  chain: RequestChain;
  identity: RequestIdentitySource;
  pohId: `0x${string}`;
}) {
  const displayedClaimerId = identity.claimer.id as Address;
  const prettyPohId = prettifyId(pohId);

  return (
    <div className="order-1 flex w-full flex-col gap-2 px-4 pt-6 md:order-none md:px-0 md:pt-0">
      <IdentityReferenceRow
        chainId={chain.id}
        external
        href={explorerLink(displayedClaimerId, chain)}
        value={displayedClaimerId}
      >
        <Identicon diameter={40} address={displayedClaimerId} />
      </IdentityReferenceRow>
      <IdentityReferenceRow
        chainId={chain.id}
        href={`/${prettyPohId}`}
        value={prettyPohId}
      >
        <Image alt="POH ID" src="/logo/pohid.svg" height={40} width={40} />
      </IdentityReferenceRow>
    </div>
  );
}

/**
 * @notice Fetches meta-evidence and renders the request policy link.
 * @dev Returns null when the meta-evidence file is unavailable or has no file
 * URI, allowing the rest of the identity card to stream without this request.
 */
async function PolicyLink({ metaEvidenceUri }: { metaEvidenceUri: string }) {
  try {
    const policyLink = (await ipfsFetch<MetaEvidenceFile>(metaEvidenceUri))
      .fileURI;

    if (!policyLink) return null;
    const href = `/attachment?url=${encodeURIComponent(policyLink)}`;

    return (
      <div className="mb-6 flex w-full items-center justify-center font-normal md:mb-0 md:justify-end">
        <Link
          href={href}
          className="group flex items-center justify-center gap-2 text-sm text-peach hover:opacity-80"
        >
          Relevant Policy
          <DocumentIcon className="h-4 w-4 fill-current transition-transform duration-200 ease-premium group-hover:-translate-y-0.5 group-hover:rotate-6" />
        </Link>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * @notice Waits for identity data and renders the registration video.
 * @dev The same media block is reused across responsive layouts.
 */
export async function IdentityVideo({
  identityFiles,
}: {
  identityFiles: RequestIdentityFiles;
}) {
  const registrationFile = await identityFiles.registrationFilePromise;
  const videoUrl = safeIpfsUrl(registrationFile?.video);

  return (
    <div className="order-5 mt-8 flex w-full flex-col gap-4 px-4 md:order-none md:mt-0 md:px-0">
      {videoUrl ? (
        <>
          <Previewed
            isVideo
            openVideoInNewTabOnError
            uri={videoUrl}
            trigger={
              <VideoThumbnail
                className="aspect-[1.8] w-full cursor-pointer rounded-2xl"
                src={videoUrl}
              />
            }
          />
          <span className="text-secondaryText text-center text-sm md:text-left">
            Tap video to preview fullscreen
          </span>
        </>
      ) : (
        <MediaFallback
          error
          label="Video unavailable"
          className="aspect-[1.8] w-full rounded-2xl"
        />
      )}
    </div>
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
  return (
    <div className="border-stroke bg-whiteBackground mb-1 overflow-hidden rounded-card border shadow-soft-inset">
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
            <div className="md:border-stroke contents md:flex md:w-[26%] md:min-w-[16rem] md:shrink-0 md:flex-col md:items-center md:border-r md:px-6 md:py-6">
              <div className="order-3 flex w-full justify-center px-6 md:order-none md:px-0">
                <MediaFallback className="h-32 w-32 rounded-full" />
              </div>
            </div>
          }
        >
          <DesktopProfileAside
            identity={identity}
            identityFiles={identityFiles}
            request={request}
            vouchedFor={vouchedFor}
            vouchers={vouchers}
          />
        </Suspense>

        <div className="contents md:flex md:w-full md:min-w-0 md:flex-col md:gap-4 md:p-6 lg:p-8">
          <Suspense
            fallback={<div className="order-1 h-72 md:order-none md:h-28" />}
          >
            <IdentityHeader chain={chain} identity={identity} pohId={pohId} />
          </Suspense>
          <div className="order-2 mt-6 flex justify-center px-6 md:order-none md:mt-0 md:px-0">
            {requestInfo}
          </div>
          <Suspense
            fallback={
              <div className="order-5 mt-8 w-full px-4 md:order-none md:mt-0 md:px-0">
                <MediaFallback className="aspect-[1.8] w-full rounded-2xl" />
              </div>
            }
          >
            <IdentityVideo identityFiles={identityFiles} />
          </Suspense>
          <div className="order-6 mt-6 px-6 md:order-none md:mt-0 md:px-0">
            <Suspense fallback={null}>
              <PolicyLink metaEvidenceUri={policyMetaEvidenceUri} />
            </Suspense>
          </div>
          <div className="border-stroke order-8 mx-6 border-t pt-4 md:order-none md:mx-0">
            {timeline}
          </div>
        </div>
      </div>
    </div>
  );
}
