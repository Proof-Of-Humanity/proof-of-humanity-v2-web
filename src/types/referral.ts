// Referral system types.

/** Admin review axis (TDD `ReferralReviewStatus`). */
export type ReferralReviewStatus = "active" | "needs-review" | "rejected";

/** Payout axis (TDD `ReferralPayoutTransactionStatus`). */
export type ReferralPayoutStatus = "not-sent" | "pending" | "confirmed";

/** Referee's registry verification, shown as the row badge. */
export type ReferredVerification = "needs-vouch" | "in-review" | "verified";

/**
 * Presentational funnel step rendered in the Figma stepper. Derived from the
 * referral's payout + verification state via `deriveStep` — never set by hand
 * once the API is wired.
 */
export type ReferralStep =
  | "started"
  | "in-progress"
  | "verified"
  | "reward-pending"
  | "paid";

export interface ReferredUser {
  /** API key — one reward per humanity ever. The API exposes only the address. */
  refereeHumanityId: `0x${string}`;
  /** Resolved from the humanity profile (not part of the referral API). */
  name?: string;
  /** IPFS photo from the humanity profile; falls back to an identicon. */
  photo?: string | null;
  /** Chain the referee's humanity lives on (profile-resolved), for the token icon. */
  chainId?: number;
  reviewStatus: ReferralReviewStatus;
  payoutStatus: ReferralPayoutStatus;
  /** Referee registry status, for the row badge. */
  verification: ReferredVerification;
  refereeFlagged: boolean;
  /** PNK locked for this referral (display units; API returns wei BigInt). */
  rewardAmount: number;
  createdAt: string;
}

export interface ReferralStats {
  verifiedReferrals: number;
  /** PNK already paid out (display units). */
  paidRewards: number;
  /** PNK pending payout (display units). */
  pendingRewards: number;
}

/** Display copy for the referral card — kept in data so the component is text-free. */
export interface ReferralCopy {
  title: string;
  heading: string;
  body: string;
  shareMessage: string;
}

export interface ReferralData {
  /** Current user's humanity (the referrer) — used for the link-row avatar. */
  referrerHumanityId: `0x${string}`;
  /** Shareable invite URL, `…/?ref=<referrerHumanityId>`. */
  referralLink: string;
  /** Whether the current user's humanity is flagged (rewards blocked). */
  humanityFlagged: boolean;
  copy: ReferralCopy;
  stats: ReferralStats;
  referred: ReferredUser[];
}
