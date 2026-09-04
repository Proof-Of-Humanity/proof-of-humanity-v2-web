import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
} from "generated/atlas";

/** Referee's PoH registry state, resolved from the subgraph — not Atlas review. */
export type ReferredRegistryStatus =
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
  /** Registration evidence URI; the avatar resolves the photo from it lazily. */
  evidenceUri: string | null;
  /** Chain the referee's humanity lives on (profile-resolved), for the token icon. */
  chainId?: number;
  reviewStatus: PohReferralReviewStatus;
  payoutStatus: PohReferralPayoutTransactionStatus;
  registryStatus: ReferredRegistryStatus;
  refereeFlagged: boolean;
  /** Attribution time in epoch ms; the expiry window counts from this. */
  createdAtMs: number;
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

export interface MonthlyPayoutUsage {
  /** Referrals assigned to a payout batch this UTC month. */
  used: number;
  cap: number;
  /** True when the caller has more referrals than one page (100) can count. */
  approximate: boolean;
}

export interface ReferrerSummary {
  humanityId: `0x${string}`;
  name?: string;
  /** Registration evidence URI; the avatar resolves the photo from it lazily. */
  evidenceUri: string | null;
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
