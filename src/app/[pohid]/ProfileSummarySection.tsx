import ExternalLink from "components/ExternalLink";
import NewTabIcon from "components/NewTabIcon";
import Card from "components/Request/Card";
import TimeAgo from "components/TimeAgo";
import { explorerLink, idToChain } from "config/chains";
import Link from "next/link";
import { shortenAddress } from "utils/address";
import { prettifyId } from "utils/identifier";
import { type Hash } from "viem";
import { RequestStatus } from "utils/status";

import { getProfilePageData } from "./profilePageData";
import Renew from "./Renew";
import ProfileSectionErrorCard from "./ProfileSectionErrorCard";

interface ProfileSummarySectionProps {
  pohId: Hash;
}

export default async function ProfileSummarySection({
  pohId,
}: ProfileSummarySectionProps) {
  try {
    const {
      humanity,
      profileState,
      pageState,
      claimedRegistration,
      claimedHomeChain,
      mainCardRequest,
      latestWinningRequest,
      canShowRenewSection,
      canRenew,
      renewalAvailableAt,
    } = await getProfilePageData(pohId);

    const showsWinningRequestCard =
      pageState === "CLAIMED" || pageState === "TRANSFER_PENDING";
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
        {claimedRegistration && claimedHomeChain ? (
          <>
            <div className="mb-2 flex text-emerald-500">
              Claimed by
              <ExternalLink
                className="ml-2 underline underline-offset-2"
                href={explorerLink(
                  claimedRegistration.claimer.id,
                  claimedHomeChain,
                )}
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

        {showsWinningRequestCard && mainCardRequest ? (
          <>
            <div className="mb-4 mt-4 flex w-full max-w-xs items-center justify-center sm:max-w-sm">
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
                      lastStatusChange:
                        "lastStatusChange" in mainCardRequest
                          ? mainCardRequest.lastStatusChange
                          : 0,
                      requester: mainCardRequest.identityRequester,
                      resolutionTime:
                        "lastStatusChange" in mainCardRequest
                          ? mainCardRequest.lastStatusChange ||
                            mainCardRequest.creationTime ||
                            0
                          : 0,
                      evidenceGroup: {
                        evidence:
                          mainCardRequest.identityEvidenceGroup.evidence,
                      },
                    },
                  ],
                }}
                index={mainCardRequest.index}
                requester={mainCardRequest.identityRequester}
                revocation={mainCardRequest.revocation}
                registrationEvidenceRevokedReq={
                  mainCardRequest.identityRegistrationEvidenceRevokedReq
                }
                requestStatus={
                  pageState === "TRANSFER_PENDING"
                    ? RequestStatus.RESOLVED_CLAIM
                    : profileState.latestWinningRequest?.requestStatus ||
                      RequestStatus.RESOLVED_CLAIM
                }
              />
            </div>

            {canShowRenewSection && claimedHomeChain && claimedRegistration ? (
              canRenew ? (
                <Renew claimer={claimedRegistration.claimer.id} pohId={pohId} />
              ) : renewalAvailableAt !== undefined ? (
                <span className="text-secondaryText mb-4 mt-2 block text-center">
                  Renewal available <TimeAgo time={renewalAvailableAt} />
                </span>
              ) : (
                <span className="text-secondaryText mb-4 mt-2 block text-center">
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
                className="btn-primary mb-6"
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
