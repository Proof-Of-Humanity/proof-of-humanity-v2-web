import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";
import {
  ReferralStep,
  ReferredUser,
  ReferredVerification,
} from "types/referral";

/** Format a PNK amount with thousands separators. */
export const formatPnk = (amount: number) =>
  `${amount.toLocaleString("en-US")} PNK`;

/** Truncate a referral link for display, e.g. `…/?ref=0xabc…` (full link is still copied). */
export const shortenReferralLink = (link: string) => {
  const [base, ref] = link.split("?ref=");
  if (!ref) return link;
  return `${base}?ref=${ref.slice(0, 5)}...`;
};

/** Badge metadata for the referee's verification status. */
export const VERIFICATION_META: Record<
  ReferredVerification,
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
    description: "The referee's claim was challenged and rejected.",
  },
  verified: { label: "Verified Human", text: "text-status-registered" },
  "revocation-pending": {
    label: "Revocation Pending",
    text: "text-status-revocation",
    description:
      "Someone requested this referee's removal from the registry. The reward is on hold until the request resolves.",
  },
};

/** Ordered funnel steps, used to render the progress tracker. */
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

/**
 * The funnel is stopped (flagged or rejected/awaiting admin review) and the
 * stepper should render frozen at its current step rather than implying
 * progress. Paid rows are never halted — the reward already went out.
 */
export const isReferralHalted = (user: ReferredUser): boolean =>
  user.payoutStatus !== PohReferralPayoutTransactionStatus.Confirmed &&
  (user.refereeFlagged ||
    user.reviewStatus === PohReferralReviewStatus.Rejected ||
    user.reviewStatus === PohReferralReviewStatus.NeedsReview ||
    user.verification === "rejected" ||
    user.verification === "revocation-pending");

/**
 * Derive the displayed funnel step from the referral's payout + verification
 * state. Payout progress wins (it's the later half of the funnel);
 */
export const deriveStep = (user: ReferredUser): ReferralStep => {
  if (user.payoutStatus === PohReferralPayoutTransactionStatus.Confirmed)
    return "paid";
  // Reward is locked in and pays automatically: referee verified, review
  // clean, nobody flagged.
  const rewardLocked =
    user.verification === "verified" &&
    !user.refereeFlagged &&
    user.reviewStatus !== PohReferralReviewStatus.NeedsReview &&
    user.reviewStatus !== PohReferralReviewStatus.Rejected;
  if (
    user.payoutStatus === PohReferralPayoutTransactionStatus.Pending ||
    rewardLocked
  )
    return "reward-pending";
  // Revocation-pending referees reached "verified" — the stepper freezes there
  // (isReferralHalted) instead of implying reward progress.
  if (
    user.verification === "verified" ||
    user.verification === "revocation-pending"
  )
    return "verified";
  if (
    user.verification === "in-review" ||
    user.verification === "needs-vouch" ||
    user.verification === "rejected"
  )
    return "in-progress";
  return "started";
};
