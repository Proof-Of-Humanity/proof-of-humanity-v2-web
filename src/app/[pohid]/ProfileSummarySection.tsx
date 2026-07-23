import ExternalLink from "components/ExternalLink";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import Card from "components/Request/Card";
import TimeAgo from "components/TimeAgo";
import { explorerLink, idToChain } from "config/chains";
import Link from "next/link";
import { Suspense } from "react";
import { shortenAddress } from "utils/address";
import { prettifyId } from "utils/identifier";
import { type Hash } from "viem";
import { RequestStatus } from "utils/status";

import {
  getProfileBaseData,
  getProfileRequestCardData,
} from "./profilePageData";
import ProfileSectionErrorCard from "./ProfileSectionErrorCard";

interface ProfileSummarySectionProps {
  pohId: Hash;
}

type ProfileBaseData = Awaited<ReturnType<typeof getProfileBaseData>>;
type ProfileMainCardProps = ProfileSummarySectionProps & {
  humanity: ProfileBaseData["humanity"];
  pageState: ProfileBaseData["pageState"];
  request: NonNullable<ProfileBaseData["latestWinningRequest"]>;
};

function ProfileMainCardSkeleton() {
  return (
    <div className="mb-3 mt-4 flex items-center justify-center">
      <div className="w-[277px] max-w-full">
        <div
          aria-label="Loading profile card"
          className="request-card-shell relative aspect-square w-full animate-pulse overflow-hidden rounded-card border"
        >
          <div className="absolute inset-0 bg-[#292D35]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="h-7 w-28 rounded-full bg-white/10" />
            <div className="h-8 w-8 rounded-full bg-white/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="h-5 w-2/3 rounded bg-white/10" />
            <div className="mt-2 h-4 w-28 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProfileMainCard({
  humanity,
  pageState,
  pohId,
  request,
}: ProfileMainCardProps) {
  try {
    const mainCardRequest = await getProfileRequestCardData(pohId, request);

    return (
      <div className="mb-3 mt-4 flex items-center justify-center">
        <div className="w-[277px] max-w-full">
          <Card
            chainId={mainCardRequest.chainId}
            claimer={mainCardRequest.identityClaimer}
            evidence={mainCardRequest.identityEvidenceGroup.evidence}
            humanity={{
              id: pohId,
              registration:
                humanity[mainCardRequest.chainId]?.humanity?.registration,
              winnerClaim: [
                {
                  claimer: mainCardRequest.identityClaimer,
                  creationTime: mainCardRequest.creationTime,
                  index: mainCardRequest.index,
                  lastStatusChange: mainCardRequest.lastStatusChange,
                  requester: mainCardRequest.identityRequester,
                  resolutionTime:
                    mainCardRequest.lastStatusChange ||
                    mainCardRequest.creationTime ||
                    0,
                  evidenceGroup: {
                    evidence: mainCardRequest.identityEvidenceGroup.evidence,
                  },
                },
              ],
            }}
            index={mainCardRequest.index}
            requester={mainCardRequest.identityRequester}
            revocation={mainCardRequest.revocation}
            registrationEvidenceRevokedReq={
              mainCardRequest.registrationEvidenceRevokedReq
            }
            requestStatus={
              pageState === "TRANSFER_PENDING"
                ? RequestStatus.RESOLVED_CLAIM
                : mainCardRequest.requestStatus
            }
          />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="mb-3 mt-4 flex w-full max-w-sm flex-col items-center gap-2 px-6 text-center">
        <span className="status-pill status-pill-muted">Card unavailable</span>
        <p className="text-secondaryText text-sm">
          We couldn&apos;t load the identity card for this profile. Other
          profile sections may still work.
        </p>
      </div>
    );
  }
}

export default async function ProfileSummarySection({
  pohId,
}: ProfileSummarySectionProps) {
  try {
    const baseData = await getProfileBaseData(pohId);
    const {
      contractData,
      pageState,
      claimedRegistration,
      homeChain,
      latestWinningRequest,
      pendingRevocation,
      canRenew,
    } = baseData;

    const showsWinningRequestCard =
      pageState === "CLAIMED" || pageState === "TRANSFER_PENDING";
    const canStartClaim =
      pageState === "NOT_CLAIMED" ||
      pageState === "REMOVED" ||
      pageState === "PUNISHED_VOUCH";
    const renewalPeriodDuration = homeChain
      ? contractData[homeChain.id]?.renewalPeriodDuration
      : undefined;
    const renewalAvailableAt =
      claimedRegistration && renewalPeriodDuration !== undefined
        ? +claimedRegistration.expirationTime - +renewalPeriodDuration
        : undefined;
    const canShowRenewAvailability =
      !!claimedRegistration && !!homeChain && !pendingRevocation && !canRenew;
    const punishedVouchSourceRequest =
      pageState === "PUNISHED_VOUCH"
        ? latestWinningRequest?.punishedVouchSourceRequest
        : null;
    const punishedVouchChain = latestWinningRequest
      ? idToChain(latestWinningRequest.chainId)
      : null;
    const punishedVouchSourceHref =
      punishedVouchSourceRequest && punishedVouchChain
        ? `/${prettifyId(
            punishedVouchSourceRequest.humanity.id,
          )}/${punishedVouchChain.name.toLowerCase()}/${
            punishedVouchSourceRequest.index
          }`
        : null;
    const punishedVouchReason =
      latestWinningRequest?.punishedVouchReason?.id === "identityTheft"
        ? "Identity Theft"
        : "Sybil Attack";

    return (
      <>
        {claimedRegistration && homeChain ? (
          <div className="mb-3 mt-4 flex flex-col items-center gap-1 text-center">
            <div className="text-secondaryText flex text-sm">
              <span>Claimed by</span>
              <ExternalLink
                className="group/external-link ml-2 inline-flex items-center gap-1 font-semibold text-peach"
                href={explorerLink(claimedRegistration.claimer.id, homeChain)}
              >
                <span className="underline underline-offset-2">
                  {shortenAddress(claimedRegistration.claimer.id)}
                </span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </ExternalLink>
            </div>
            <span className="text-secondaryText text-xs">
              {claimedRegistration.expirationTime < Date.now() / 1000
                ? "Expired "
                : "Expires "}
              <TimeAgo time={claimedRegistration.expirationTime} />
            </span>
          </div>
        ) : null}

        {pageState === "TRANSFER_PENDING" ? (
          <span className="status-pill status-pill-warning mb-2 mt-4">
            Transfer pending
          </span>
        ) : null}

        {showsWinningRequestCard && latestWinningRequest ? (
          <>
            <div className="border-stroke mt-1 h-px w-full border-t" />
            <Suspense fallback={<ProfileMainCardSkeleton />}>
              <ProfileMainCard
                humanity={baseData.humanity}
                pageState={pageState}
                pohId={pohId}
                request={latestWinningRequest}
              />
            </Suspense>

            {canShowRenewAvailability && claimedRegistration && homeChain ? (
              renewalAvailableAt !== undefined ? (
                <span className="text-secondaryText mb-2">
                  Renewal available <TimeAgo time={renewalAvailableAt} />
                </span>
              ) : (
                <span className="text-secondaryText mb-2">
                  Renewal timing is temporarily unavailable.
                </span>
              )
            ) : null}
          </>
        ) : (
          <>
            {punishedVouchSourceHref ? (
              <div className="mb-6 mt-4 flex max-w-xl flex-col items-center gap-3 px-6 text-center">
                <span className="status-pill status-pill-danger">
                  Punished vouch
                </span>
                <p className="text-secondaryText text-sm font-normal leading-6">
                  This profile was removed for aiding {punishedVouchReason}.{" "}
                  <Link
                    className="group/external-link text-orange inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
                    href={punishedVouchSourceHref}
                  >
                    View source request
                    <ExternalLinkIcon />
                  </Link>
                </p>
              </div>
            ) : (
              <span
                className={`status-pill mb-6 mt-4 ${
                  pageState === "REMOVED" || pageState === "PUNISHED_VOUCH"
                    ? "status-pill-danger"
                    : "status-pill-muted"
                }`}
              >
                {pageState === "REMOVED"
                  ? "Removed"
                  : pageState === "PUNISHED_VOUCH"
                    ? "Punished vouch"
                    : "Not claimed"}
              </span>
            )}
            <div className="border-stroke mb-4 h-px w-full border-t" />
            {canStartClaim ? (
              <Link
                className="btn-primary mb-2 w-fit min-w-[170px] whitespace-nowrap"
                href={`/${pohId}/claim`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim Humanity
              </Link>
            ) : null}
          </>
        )}
      </>
    );
  } catch {
    return (
      <div className="w-full px-6">
        <ProfileSectionErrorCard
          section="Summary"
          title="Summary unavailable"
          description="We couldn't load the current registration summary for this profile."
        />
      </div>
    );
  }
}
