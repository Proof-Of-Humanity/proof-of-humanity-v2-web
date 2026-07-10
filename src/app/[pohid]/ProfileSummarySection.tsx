import ExternalLink from "components/ExternalLink";
import NewTabIcon from "components/NewTabIcon";
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
      <div
        aria-label="Loading profile card"
        className="aspect-square w-80 max-w-full animate-pulse rounded-card bg-slate-200"
      />
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
        <div className="w-80 max-w-full">
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
    return null;
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
          <>
            <div className="mb-2 flex text-emerald-500">
              Claimed by
              <ExternalLink
                className="ml-2 underline underline-offset-2"
                href={explorerLink(claimedRegistration.claimer.id, homeChain)}
              >
                {shortenAddress(claimedRegistration.claimer.id)}
              </ExternalLink>
            </div>
            <span className="text-secondaryText mb-2">
              {claimedRegistration.expirationTime < Date.now() / 1000
                ? "Expired "
                : "Expires "}
              <TimeAgo time={claimedRegistration.expirationTime} />
            </span>
          </>
        ) : null}

        {pageState === "TRANSFER_PENDING" ? (
          <span className="text-secondaryText mb-2">Transfer pending.</span>
        ) : null}

        {showsWinningRequestCard && latestWinningRequest ? (
          <>
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
                <span className="text-secondaryText mb-4">
                  Renewal available <TimeAgo time={renewalAvailableAt} />
                </span>
              ) : (
                <span className="text-secondaryText mb-4">
                  Renewal timing is temporarily unavailable.
                </span>
              )
            ) : null}
          </>
        ) : (
          <>
            {punishedVouchSourceHref && latestWinningRequest ? (
              <p className="text-secondaryText mb-6 max-w-xl px-6 text-center text-sm font-normal leading-6">
                This profile was removed for aiding {punishedVouchReason}.{" "}
                <Link
                  className="group/source-request text-orange inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
                  href={punishedVouchSourceHref}
                >
                  View source request
                  <NewTabIcon className="h-4 w-4 fill-current transition-transform duration-200 group-hover/source-request:-translate-y-0.5 group-hover/source-request:translate-x-0.5" />
                </Link>
              </p>
            ) : (
              <span className="text-orange mb-6">
                {pageState === "REMOVED" ? "Removed" : "Not claimed"}
              </span>
            )}
            {pageState === "NOT_CLAIMED" ||
            pageState === "REMOVED" ||
            pageState === "PUNISHED_VOUCH" ? (
              <Link
                className="btn-main mb-6"
                href={`/${pohId}/claim`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim humanity
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
