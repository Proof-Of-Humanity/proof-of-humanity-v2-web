import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";
import {
  ReferralStep,
  ReferredUser,
  ReferredVerification,
} from "types/referral";

export const formatPnk = (amount: number) =>
  `${amount.toLocaleString("en-US")} PNK`;

/** Display-only; the full link is what gets copied. */
export const shortenReferralLink = (link: string) => {
  const [base, ref] = link.split("?ref=");
  if (!ref) return link;
  return `${base}?ref=${ref.slice(0, 5)}...`;
};

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
      "Someone requested this referee's removal from the registry.",
  },
  removed: {
    label: "Removed from Registry",
    text: "text-status-rejected",
    description:
      "This referee was verified but has since been removed from the registry.",
  },
  expired: {
    label: "Registration Expired",
    text: "text-secondaryText",
    description: "This referee's registration lapsed and can be renewed.",
  },
};

export const getVerificationDescription = (
  user: ReferredUser,
): string | undefined => {
  const base = VERIFICATION_META[user.verification].description;
  if (base === undefined) return undefined;
  if (user.payoutStatus === PohReferralPayoutTransactionStatus.Confirmed)
    return user.verification === "removed" || user.verification === "expired"
      ? `${base} The reward already paid is unaffected.`
      : base;
  if (user.verification === "revocation-pending")
    // A broadcast payout can no longer be stopped; only an unsent reward is
    // actually held back by the pending revocation.
    return user.payoutStatus === PohReferralPayoutTransactionStatus.NotSent
      ? `${base} The reward is on hold until the request resolves.`
      : `${base} The payout already in flight is unaffected.`;
  return base;
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

/**
 * The funnel is stopped (flagged or rejected/awaiting admin review) and the
 * stepper should render frozen at its current step rather than implying
 * progress. Paid rows are never halted — the reward already went out — and
 * neither are broadcast (Pending) payouts: the transaction is in flight and
 * nothing shown here can stop it.
 */
export const isReferralHalted = (user: ReferredUser): boolean =>
  user.payoutStatus === PohReferralPayoutTransactionStatus.NotSent &&
  (user.refereeFlagged ||
    user.reviewStatus === PohReferralReviewStatus.Rejected ||
    user.reviewStatus === PohReferralReviewStatus.NeedsReview ||
    user.verification === "rejected" ||
    user.verification === "revocation-pending" ||
    user.verification === "removed");

/** Payout progress wins over verification (it's the later half of the funnel). */
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
  if (
    user.verification === "verified" ||
    user.verification === "revocation-pending" ||
    user.verification === "removed" ||
    user.verification === "expired"
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
