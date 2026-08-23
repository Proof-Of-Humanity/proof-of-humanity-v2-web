import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";

/** Referee's registry verification, shown as the row badge. */
export type ReferredVerification =
  | "not-registered"
  | "needs-vouch"
  | "in-review"
  | "rejected"
  | "verified"
  | "revocation-pending";

/** Funnel step; derived from payout + verification via `deriveStep`. */
export type ReferralStep =
  | "started"
  | "in-progress"
  | "verified"
  | "reward-pending"
  | "paid";

export interface ReferredUser {
  /** one reward per humanity ever. The API exposes only the address. */
  refereeHumanityId: `0x${string}`;
  /** Resolved from the humanity profile (not part of the referral API). */
  name?: string;
  /** IPFS photo from the humanity profile; falls back to an identicon. */
  photo: string | null;
  /** Chain the referee's humanity lives on (profile-resolved), for the token icon. */
  chainId?: number;
  reviewStatus: PohReferralReviewStatus;
  payoutStatus: PohReferralPayoutTransactionStatus;
  /** Referee registry status, for the row badge. */
  verification: ReferredVerification;
  refereeFlagged: boolean;
  /** PNK locked for this referral (display units; API returns wei). */
  rewardAmount: number;
  /** Payout transaction hash once the bot has sent it; null before. */
  payoutTxHash: string | null;
}

export interface ReferralStats {
  verifiedReferrals: number;
  /** PNK already paid out (display units). */
  paidRewards: number;
  /** PNK pending payout (display units). */
  pendingRewards: number;
}

/** The signed-in user's own referrer identity; fetched once per session. */
export interface ReferrerSummary {
  /** Current user's humanity — used for the link-row avatar and invite URL. */
  humanityId: `0x${string}`;
  /** Referrer's registration photo (IPFS path); null → identicon fallback. */
  photo: string | null;
  /** Shareable invite URL, `…/?ref=<humanityId>`. */
  referralLink: string;
  /** Referrer's own humanity has a revocation request in progress. */
  pendingRevocation: boolean;
}

/** One page of the referred list, plus the aggregates that ride along. */
export interface ReferralPage {
  /** Whether the current user's humanity is flagged (rewards blocked). */
  humanityFlagged: boolean;
  stats: ReferralStats;
  /** Total referrals across all pages. */
  totalCount: number;
  referred: ReferredUser[];
}
