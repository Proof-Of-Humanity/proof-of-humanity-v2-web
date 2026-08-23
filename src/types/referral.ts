import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";

export type ReferredVerification =
  | "not-registered"
  | "needs-vouch"
  | "in-review"
  | "rejected"
  | "verified"
  | "revocation-pending"
  | "removed"
  | "expired";

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

export interface ReferrerSummary {
  humanityId: `0x${string}`;
  /** Referrer's registration photo (IPFS path); null → identicon fallback. */
  photo: string | null;
  /** Shareable invite URL, `…/?ref=<humanityId>`. */
  referralLink: string;
  pendingRevocation: boolean;
}

export interface ReferralPage {
  /** Flagged referrers have rewards blocked. */
  humanityFlagged: boolean;
  stats: ReferralStats;
  totalCount: number;
  referred: ReferredUser[];
}
