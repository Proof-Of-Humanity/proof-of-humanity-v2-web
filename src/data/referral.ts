import { gnosis } from "viem/chains";
import {
  ReferralData,
  ReferralStep,
  ReferredUser,
  ReferredVerification,
} from "types/referral";

// Mock referral data + presentation helpers.
//
// TODO(referral-backend): replace MOCK_REFERRAL_DATA with the `PohReferrals` /
// `PohReferralStats` queries once the referral API is deployed.

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
  { label: string; text: string }
> = {
  "needs-vouch": { label: "Needs Vouch", text: "text-status-vouching" },
  "in-review": { label: "In Review", text: "text-status-claim" },
  verified: { label: "Verified Human", text: "text-status-registered" },
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
 * Derive the displayed funnel step from the referral's payout + verification
 * state. Payout progress wins (it's the later half of the funnel); otherwise we
 * fall back to how far the referee has gotten through verification.
 */
export const deriveStep = (user: ReferredUser): ReferralStep => {
  if (user.payoutStatus === "confirmed") return "paid";
  if (user.payoutStatus === "pending") return "reward-pending";
  if (user.verification === "verified") return "verified";
  if (user.verification === "in-review") return "in-progress";
  return "started";
};

export const MOCK_REFERRAL_DATA: ReferralData = {
  referrerHumanityId: "0xabc1234567890def1234567890abcdef12345678",
  referralLink:
    "https://v2.proofofhumanity.id/?ref=0xabc1234567890def1234567890abcdef12345678",
  humanityFlagged: false,
  copy: {
    title: "Referral",
    heading: "Invite Humans",
    body: "Earn 250 PNK when someone you invite becomes verified on PoH. Completing 5 successful verified referrals, you get the exclusive Human Connector badge.",
    shareMessage:
      "Join Proof of Humanity, the registry of real humans, and claim your rewards:",
  },
  stats: {
    verifiedReferrals: 12,
    paidRewards: 24000,
    pendingRewards: 250,
  },
  referred: [
    {
      refereeHumanityId: "0x66a1d5f3b4e2c1908f7d6e5a4b3c2d1e0f9a8dd6",
      name: "Tim Wolf",
      photo: null,
      chainId: gnosis.id,
      reviewStatus: "active",
      payoutStatus: "not-sent",
      verification: "needs-vouch",
      refereeFlagged: false,
      rewardAmount: 250,
      createdAt: "2026-06-01T10:00:00Z",
    },
    {
      refereeHumanityId: "0x66b2e6a4c5d3f2019a8e7d6b5c4d3e2f1a0b8dd6",
      name: "Luna Boom",
      photo: null,
      chainId: gnosis.id,
      reviewStatus: "active",
      payoutStatus: "not-sent",
      verification: "in-review",
      refereeFlagged: false,
      rewardAmount: 250,
      createdAt: "2026-06-03T10:00:00Z",
    },
    {
      refereeHumanityId: "0x66c3f7b5d6e4031ab9f8e7c6d5e4f3a2b1c08dd6",
      name: "Brigitte",
      photo: null,
      chainId: gnosis.id,
      reviewStatus: "active",
      payoutStatus: "not-sent",
      verification: "verified",
      refereeFlagged: false,
      rewardAmount: 250,
      createdAt: "2026-06-05T10:00:00Z",
    },
    {
      refereeHumanityId: "0x66d4a8c6e7f5142bca09f8d7e6f5a4b3c2d18dd6",
      name: "Alice Block",
      photo: null,
      chainId: gnosis.id,
      reviewStatus: "active",
      payoutStatus: "pending",
      verification: "verified",
      refereeFlagged: false,
      rewardAmount: 250,
      createdAt: "2026-06-07T10:00:00Z",
    },
    {
      refereeHumanityId: "0x66e5b9d7f8061253db1a09e8f7a6b5c4d3e28dd6",
      name: "Ann Cheng",
      photo: null,
      chainId: gnosis.id,
      reviewStatus: "active",
      payoutStatus: "confirmed",
      verification: "verified",
      refereeFlagged: false,
      rewardAmount: 250,
      createdAt: "2026-06-09T10:00:00Z",
    },
  ],
};
