"use client";

import Image from "next/image";
import Link from "next/link";
import cn from "classnames";
import ChainLogo from "components/ChainLogo";
import Identicon from "components/Identicon";
import { defaultChain, explorerTxLink } from "config/chains";
import NewTabIcon from "icons/NewTab.svg";
import NeedsVouchIcon from "icons/NeedsVouch.svg";
import EyeIcon from "icons/Eye.svg";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline.svg";
import WarningIcon from "icons/WarningCircleOutline16.svg";
import RejectedIcon from "icons/CircleCancelFilled16.svg";
import RemovedIcon from "icons/CrossCircle16.svg";
import HourglassIcon from "icons/Hourglass.svg";
import {
  REFERRAL_EXPIRY_WINDOW_DAYS,
  REGISTRY_STATUS_META,
  deriveStep,
  formatPnk,
  getRegistryStatusDescription,
  isPayoutInFlight,
  isReferralExpired,
  isReferralHalted,
  isRewardAwaitingReview,
} from "data/referralPresentation";
import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";
import { ReferredUser, ReferredRegistryStatus } from "types/referral";
import { shortenAddress } from "utils/address";
import { safeIpfsUrl } from "utils/ipfs";
import { prettifyId } from "utils/identifier";
import ReferralSteps from "./ReferralSteps";

interface ReferredUserRowProps {
  user: ReferredUser;
}

const REGISTRY_STATUS_ICON: Record<
  ReferredRegistryStatus,
  React.FC<React.SVGAttributes<SVGElement>>
> = {
  "not-registered": HourglassIcon,
  "needs-vouch": NeedsVouchIcon,
  "in-review": EyeIcon,
  rejected: RejectedIcon,
  verified: CheckCircleOutlineIcon,
  "revocation-pending": WarningIcon,
  removed: RemovedIcon,
  expired: HourglassIcon,
};

const getRowStatus = (user: ReferredUser) => {
  // A confirmed payout is terminal — a later flag or review verdict must not
  // claim the (already paid) reward is paused or ineligible.
  if (user.payoutStatus === PohReferralPayoutTransactionStatus.Confirmed)
    return {
      ...REGISTRY_STATUS_META[user.registryStatus],
      description: getRegistryStatusDescription(user),
      Icon: REGISTRY_STATUS_ICON[user.registryStatus],
    };

  const payoutInFlight = isPayoutInFlight(user);

  if (user.refereeFlagged)
    return {
      label: "Invitee Flagged",
      text: "text-status-rejected",
      Icon: WarningIcon,
      description: payoutInFlight
        ? "This invitee's profile has been flagged. The payout already in flight is unaffected; future rewards are paused."
        : "Referral rewards are paused while this invitee's profile is flagged.",
    };

  if (user.reviewStatus === PohReferralReviewStatus.Rejected)
    return {
      label: "Referral Rejected",
      text: "text-status-rejected",
      Icon: RejectedIcon,
      description: payoutInFlight
        ? "This referral was rejected, but the payout already in flight is unaffected."
        : "This referral is not eligible for rewards.",
    };

  if (user.reviewStatus === PohReferralReviewStatus.NeedsReview)
    return {
      label: "Needs Review",
      text: "text-status-challenged",
      Icon: WarningIcon,
      description: payoutInFlight
        ? "This referral needs admin review. The payout already in flight is unaffected."
        : "This referral needs admin review before payout.",
    };

  if (isReferralExpired(user))
    return {
      label: "Referral Expired",
      text: "text-secondaryText",
      Icon: HourglassIcon,
      description: `This referral was not completed within ${REFERRAL_EXPIRY_WINDOW_DAYS} days and is no longer eligible for a reward.`,
    };

  const status = REGISTRY_STATUS_META[user.registryStatus];
  return {
    ...status,
    description: getRegistryStatusDescription(user),
    Icon: REGISTRY_STATUS_ICON[user.registryStatus],
  };
};

const ReviewWindowNote: React.FC<{ user: ReferredUser }> = ({ user }) =>
  isRewardAwaitingReview(user) ? (
    <p className="text-secondaryText mt-1 w-full text-xs">
      Reward is in the review window
    </p>
  ) : null;

const ReferredUserRow: React.FC<ReferredUserRowProps> = ({ user }) => {
  const status = getRowStatus(user);
  const StatusIcon = status.Icon;
  const displayName = user.name ?? shortenAddress(user.refereeHumanityId);
  // Referee-controlled evidence; an invalid URI falls back to the identicon.
  const photoUrl = user.photo ? safeIpfsUrl(user.photo) : null;

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {photoUrl ? (
            <Image
              className="h-6 w-6 shrink-0 rounded-full object-cover"
              alt={displayName}
              src={photoUrl}
              width={24}
              height={24}
              unoptimized
            />
          ) : (
            <Identicon address={user.refereeHumanityId} diameter={24} />
          )}
          <span className="text-primaryText min-w-0 max-w-full break-words font-semibold">
            {displayName}
          </span>
          <Link
            href={`/${prettifyId(user.refereeHumanityId)}`}
            className="text-secondaryText hover:text-primaryText inline-flex items-center gap-1.5 text-sm transition-colors"
            aria-label={`View ${displayName}'s profile`}
          >
            {user.chainId && (
              <ChainLogo
                chainId={user.chainId}
                className="text-secondaryText h-4 w-4 fill-current"
              />
            )}
            {shortenAddress(user.refereeHumanityId)}
            <span className="border-stroke flex h-[18px] w-[18px] items-center justify-center rounded-md border">
              <NewTabIcon className="fill-secondaryText h-2.5 w-2.5" />
            </span>
          </Link>
        </div>
        <ReferralSteps
          active={deriveStep(user)}
          halted={isReferralHalted(user)}
        />
      </div>

      <div className="flex w-full shrink-0 flex-col items-start sm:w-64 sm:items-end sm:text-right">
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-semibold sm:justify-end",
            status.text,
          )}
          aria-label={`Status: ${status.label}. Reward: ${formatPnk(
            user.rewardAmount,
          )}${status.description ? `. ${status.description}` : ""}`}
          title={status.description}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {status.label}
          </span>
          <span className="text-secondaryText whitespace-nowrap text-xs font-normal">
            · {formatPnk(user.rewardAmount)}
          </span>
        </div>
        {status.description && (
          <p className="text-secondaryText mt-1 w-full text-xs leading-5">
            {status.description}
          </p>
        )}
        <ReviewWindowNote user={user} />
        {/* NOT_SENT can carry a precomputed hash that was never broadcast —
            linking it would 404 on the explorer. */}
        {user.payoutTxHash &&
          user.payoutStatus !== PohReferralPayoutTransactionStatus.NotSent && (
            <a
              href={explorerTxLink(user.payoutTxHash, defaultChain)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondaryText hover:text-primaryText mt-1 flex flex-wrap items-center gap-1 text-xs transition-colors sm:justify-end"
              aria-label="View payout transaction on the block explorer"
            >
              {user.payoutStatus ===
              PohReferralPayoutTransactionStatus.Confirmed
                ? "Reward paid"
                : "Payout pending"}{" "}
              · View transaction
              <NewTabIcon className="fill-secondaryText h-2.5 w-2.5 shrink-0" />
            </a>
          )}
      </div>
    </div>
  );
};

export default ReferredUserRow;
