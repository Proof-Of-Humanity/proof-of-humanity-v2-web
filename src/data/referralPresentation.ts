import { ChainSet, configSetSelection } from "contracts";
import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";
import {
  ReferralStep,
  ReferredUser,
  ReferredRegistryStatus,
} from "types/referral";

export const formatPnk = (amount: number) =>
  `${amount.toLocaleString("en-US")} PNK`;

const IS_MAINNET = configSetSelection.chainSet === ChainSet.MAINNETS;
/** Payout hold after verification: 2 days on mainnet, 30 minutes on testnet. */
export const REFERRAL_REVIEW_WINDOW = IS_MAINNET ? "2 day" : "30 minute";
export const REFERRAL_EXPIRY_WINDOW_DAYS = 30;
export const REFERRAL_EXPIRY_WINDOW_MS =
  REFERRAL_EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
export const REFERRAL_MONTHLY_PAYOUT_CAP = 25;

/** Display default for marketing copy; the authoritative per-referral amount
 *  is `rewardAmount` from the API. */
export const REFERRAL_REWARD_PNK = IS_MAINNET ? 250 : 5;

export const shortenReferralLink = (link: string) => {
  const [base, ref] = link.split("?ref=");
  if (!ref) return link;
  return `${base}?ref=${ref.slice(0, 5)}...`;
};

export const REGISTRY_STATUS_META: Record<
  ReferredRegistryStatus,
  { label: string; text: string; description?: string }
> = {
  "not-registered": {
    label: "Not Registered Yet",
    text: "text-secondaryText",
  },
  "needs-vouch": { label: "Needs Vouch", text: "text-status-vouching" },
  "in-review": { label: "In Review", text: "text-status-claim" },
  rejected: {
    label: "Claim Rejected",
    text: "text-status-rejected",
    description: "The invitee's claim was challenged and rejected.",
  },
  verified: { label: "Verified Human", text: "text-status-registered" },
  "revocation-pending": {
    label: "Revocation Pending",
    text: "text-status-revocation",
    description: "This invitee's removal from the registry has been requested.",
  },
  removed: {
    label: "Removed from Registry",
    text: "text-status-rejected",
    description:
      "This invitee was previously verified but has since been removed from the PoH registry.",
  },
  expired: {
    label: "Registration Expired",
    text: "text-secondaryText",
    description: "This invitee's registration has expired and can be renewed.",
  },
};

export const getRegistryStatusDescription = (
  user: ReferredUser,
): string | undefined => {
  if (user.payoutStatus === PohReferralPayoutTransactionStatus.Confirmed) {
    if (user.registryStatus === "removed")
      return "This invitee was verified but has since been removed from the registry. The reward already paid is unaffected.";
    if (user.registryStatus === "expired")
      return "This invitee's registration has expired and can be renewed. The reward already paid is unaffected.";
    return REGISTRY_STATUS_META[user.registryStatus].description;
  }
  if (user.registryStatus === "revocation-pending")
    return isPayoutInFlight(user)
      ? "This invitee's removal from the registry has been requested. The payout already in flight is unaffected."
      : "A request has been made to remove this invitee from the registry. The reward is on hold until the request is resolved.";
  return REGISTRY_STATUS_META[user.registryStatus].description;
};

export const REFERRAL_STEPS: ReferralStep[] = [
  "started",
  "in-progress",
  "verified",
  "reward-pending",
  "paid",
];

export const REFERRAL_STEP_LABELS: Record<ReferralStep, string> = {
  started: "Started",
  "in-progress": "In Progress",
  verified: "Verified",
  "reward-pending": "Reward Pending",
  paid: "Paid",
};

export const REFERRAL_STEP_TOOLTIPS: Record<ReferralStep, string> = {
  started: `This user joined through your referral link. They have ${REFERRAL_EXPIRY_WINDOW_DAYS} days to get verified, and the reward must clear a ${REFERRAL_REVIEW_WINDOW} review window before that deadline.`,
  "in-progress": "This user has started their PoH registration.",
  verified: `This user completed their registration and is now verified on PoH. The reward is released after a ${REFERRAL_REVIEW_WINDOW} review window.`,
  "reward-pending": `Your referral is eligible for a reward. Payouts are released automatically once the ${REFERRAL_REVIEW_WINDOW} review window has passed.`,
  paid: "Your referral reward has been sent to your wallet.",
};

const hasReservedPayout = (user: ReferredUser): boolean =>
  user.payoutTxHash !== null;

/** Reserved but not yet confirmed on chain. NotSent already carries the signed
 *  transaction, so it is in flight exactly like Pending. */
export const isPayoutInFlight = (user: ReferredUser): boolean =>
  hasReservedPayout(user) &&
  user.payoutStatus !== PohReferralPayoutTransactionStatus.Confirmed;

export const isReferralExpired = (
  user: ReferredUser,
  nowMs = Date.now(),
): boolean =>
  !hasReservedPayout(user) &&
  user.reviewStatus === PohReferralReviewStatus.Active &&
  nowMs - user.createdAtMs > REFERRAL_EXPIRY_WINDOW_MS;

export const isRewardAwaitingReview = (user: ReferredUser): boolean =>
  user.registryStatus === "verified" &&
  !hasReservedPayout(user) &&
  !isReferralHalted(user);

export const isReferralHalted = (user: ReferredUser): boolean =>
  !hasReservedPayout(user) &&
  (isReferralExpired(user) ||
    user.refereeFlagged ||
    user.reviewStatus === PohReferralReviewStatus.Rejected ||
    user.reviewStatus === PohReferralReviewStatus.NeedsReview ||
    user.registryStatus === "rejected" ||
    user.registryStatus === "revocation-pending" ||
    user.registryStatus === "removed" ||
    user.registryStatus === "expired");

/** Payout progress wins over registry status (it's the later half of the funnel). */
export const deriveStep = (user: ReferredUser): ReferralStep => {
  if (user.payoutStatus === PohReferralPayoutTransactionStatus.Confirmed)
    return "paid";
  // Reward is locked in and pays automatically: referee verified, review
  // clean, nobody flagged.
  const rewardLocked =
    user.registryStatus === "verified" &&
    !user.refereeFlagged &&
    !isReferralExpired(user) &&
    user.reviewStatus !== PohReferralReviewStatus.NeedsReview &&
    user.reviewStatus !== PohReferralReviewStatus.Rejected;
  if (isPayoutInFlight(user) || rewardLocked) return "reward-pending";
  if (
    user.registryStatus === "verified" ||
    user.registryStatus === "revocation-pending" ||
    user.registryStatus === "removed" ||
    user.registryStatus === "expired"
  )
    return "verified";
  if (
    user.registryStatus === "in-review" ||
    user.registryStatus === "needs-vouch" ||
    user.registryStatus === "rejected"
  )
    return "in-progress";
  return "started";
};
