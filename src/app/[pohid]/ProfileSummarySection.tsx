import ExternalLink from "components/ExternalLink";
import Card from "components/Request/Card";
import TimeAgo from "components/TimeAgo";
import { explorerLink } from "config/chains";
import Link from "next/link";
import { shortenAddress } from "utils/address";
import { type Hash } from "viem";
import { RequestStatus } from "utils/status";

import { getProfilePageData } from "./profilePageData";
import Renew from "./Renew";

interface ProfileSummarySectionProps {
  pohId: Hash;
}

export default async function ProfileSummarySection({
  pohId,
}: ProfileSummarySectionProps) {
  const {
    humanity,
    contractData,
    profileState,
    pageState,
    claimedRegistration,
    claimedHomeChain,
    mainCardRequest,
    canShowRenewSection,
    canRenew,
  } = await getProfilePageData(pohId);

  const showsWinningRequestCard =
    pageState === "CLAIMED" || pageState === "TRANSFER_PENDING";

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
          <div className="mb-3 mt-4 flex items-center justify-center">
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
                    index: mainCardRequest.index,
                    resolutionTime:
                      "lastStatusChange" in mainCardRequest
                        ? mainCardRequest.lastStatusChange ||
                          mainCardRequest.creationTime ||
                          0
                        : 0,
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
            ) : (
              <span className="text-secondaryText mb-4">
                Renewal available{" "}
                <TimeAgo
                  time={
                    +claimedRegistration.expirationTime -
                    +contractData[claimedHomeChain.id].renewalPeriodDuration
                  }
                />
              </span>
            )
          ) : null}
        </>
      ) : (
        <>
          <span className="text-orange mb-6">
            {pageState === "REMOVED" ? "Removed" : "Not claimed"}
          </span>
          {pageState === "NOT_CLAIMED" || pageState === "REMOVED" ? (
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
}
