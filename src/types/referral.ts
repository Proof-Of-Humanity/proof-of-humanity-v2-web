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

/**
 * Presentational funnel step rendered in the stepper. Derived from the
 * referral's payout + verification state via `deriveStep` — never set by hand.
 */
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
  photo?: string | null;
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
  payoutTxHash?: string | null;
}

export interface ReferralStats {
  verifiedReferrals: number;
  /** PNK already paid out (display units). */
  paidRewards: number;
  /** PNK pending payout (display units). */
  pendingRewards: number;
}

export interface ReferralData {
  /** Current user's humanity (the referrer) — used for the link-row avatar. */
  referrerHumanityId: `0x${string}`;
  /** Referrer's registration photo (IPFS path); null → identicon fallback. */
  referrerPhoto?: string | null;
  /** Shareable invite URL, `…/?ref=<referrerHumanityId>`. */
  referralLink: string;
  /** Whether the current user's humanity is flagged (rewards blocked). */
  humanityFlagged: boolean;
  /** Referrer's own humanity has a revocation request in progress. */
  referrerPendingRevocation: boolean;
  /** Referrer's registration lapsed — the invite link won't attribute until renewed. */
  referrerRegistrationExpired: boolean;
  /** Server-side aggregates; null when Atlas doesn't return them (bar hidden). */
  stats: ReferralStats | null;
  referred: ReferredUser[];
}
