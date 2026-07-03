import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import {
  PohReferralPayoutTransactionStatus,
  PohReferralReviewStatus,
  SortByTimeStamp,
} from "generated/atlas";
import {
  ReferralData,
  ReferralPayoutStatus,
  ReferralReviewStatus,
  ReferralStep,
  ReferredUser,
  ReferredVerification,
} from "types/referral";
import { formatUnits } from "viem";
import { getAuthedAtlasSdk, getRegistrationPhoto } from "./referralAttribution";

// Referral dashboard data fetching + presentation helpers.

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

const REVIEW_STATUS: Record<PohReferralReviewStatus, ReferralReviewStatus> = {
  [PohReferralReviewStatus.Active]: "active",
  [PohReferralReviewStatus.NeedsReview]: "needs-review",
  [PohReferralReviewStatus.Approved]: "approved",
  [PohReferralReviewStatus.Rejected]: "rejected",
};

const PAYOUT_STATUS: Record<
  PohReferralPayoutTransactionStatus,
  ReferralPayoutStatus
> = {
  [PohReferralPayoutTransactionStatus.NotSent]: "not-sent",
  [PohReferralPayoutTransactionStatus.Pending]: "pending",
  [PohReferralPayoutTransactionStatus.Confirmed]: "confirmed",
};

/** The referrer's own humanity — the id the invite link carries. */
const getOwnHumanityId = async (
  address: `0x${string}`,
): Promise<`0x${string}` | null> => {
  const now = Math.ceil(Date.now() / 1000);
  const results = await Promise.allSettled(
    supportedChains.map((chain) =>
      sdk[chain.id].HumanityIdByClaimer({
        address: address.toLowerCase(),
        now,
      }),
    ),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const id =
      result.value.registrations[0]?.humanity.id ??
      result.value.crossChainRegistrations[0]?.id;
    if (id) return String(id).toLowerCase() as `0x${string}`;
  }
  return null;
};

interface RefereeProfile {
  name?: string;
  photo?: string | null;
  chainId?: number;
  verification: ReferredVerification;
}

/**
 * Resolves referee display profiles from the PoH subgraphs. The referral API
 * only stores addresses; names, photos and registry status live on-chain.
 */
const resolveRefereeProfiles = async (
  ids: string[],
): Promise<Map<string, RefereeProfile>> => {
  const profiles = new Map<string, RefereeProfile & { evidenceUri?: string }>();
  if (ids.length === 0) return profiles;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const results = await Promise.allSettled(
    supportedChains.map(async (chain) => ({
      chainId: chain.id,
      data: await sdk[chain.id].ReferralRefereeProfiles({ ids }),
    })),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { chainId, data } = result.value;

    for (const humanity of data.humanities) {
      const id = String(humanity.id).toLowerCase();
      // Prefer the chain where the referee is actually registered.
      if (profiles.get(id)?.verification === "verified") continue;

      const registration = humanity.registration;
      const request = humanity.claimRequests[0];
      const verification: ReferredVerification =
        registration && BigInt(registration.expirationTime) > now
          ? "verified"
          : request?.status.id === "vouching"
            ? "needs-vouch"
            : "in-review";

      profiles.set(id, {
        name:
          registration?.claimer.name?.trim() ||
          request?.claimer.name?.trim() ||
          undefined,
        chainId,
        verification,
        evidenceUri: request?.evidenceGroup.evidence[0]?.uri,
      });
    }
  }

  await Promise.all(
    [...profiles.values()].map(async (profile) => {
      profile.photo = await getRegistrationPhoto(profile.evidenceUri);
    }),
  );

  return profiles;
};

const toPnk = (wei: string) => Number(formatUnits(BigInt(wei), 18));

/**
 * Loads everything the referral card needs: the signed-in user's referrals
 * from Atlas, referee profiles from the subgraphs, and stats derived from the
 * list (the API exposes no stats query).
 * Returns null when the address has no humanity (nothing to refer with).
 */
export const fetchReferralDashboard = async (
  address: `0x${string}`,
): Promise<ReferralData | null> => {
  const humanityId = await getOwnHumanityId(address);
  if (!humanityId) return null;

  const { humanityFlag, pohReferrals } =
    await getAuthedAtlasSdk().PohReferralDashboard({
      // ponytail: one 100-row page — wire real pagination when a referrer exceeds it
      pagination: { take: 100, sortByTimeStamp: SortByTimeStamp.Desc },
    });

  const rows = (pohReferrals.items ?? []).map(({ item }) => item);
  const profiles = await resolveRefereeProfiles(
    rows.map((row) => row.refereeHumanityId.toLowerCase()),
  );

  const referred: ReferredUser[] = rows.map((row) => {
    const refereeHumanityId =
      row.refereeHumanityId.toLowerCase() as `0x${string}`;
    const profile = profiles.get(refereeHumanityId);
    return {
      refereeHumanityId,
      name: profile?.name,
      photo: profile?.photo ?? null,
      chainId: profile?.chainId,
      reviewStatus: REVIEW_STATUS[row.reviewStatus],
      payoutStatus: row.payoutTransaction
        ? PAYOUT_STATUS[row.payoutTransaction.status]
        : "not-sent",
      // Attribution can exist before the referee even starts a claim.
      verification: profile?.verification ?? "needs-vouch",
      refereeFlagged: row.refereeFlag?.isFlagged ?? false,
      rewardAmount: toPnk(row.rewardAmount),
    };
  });

  const paidRewards = referred
    .filter((user) => user.payoutStatus === "confirmed")
    .reduce((sum, user) => sum + user.rewardAmount, 0);
  const pendingRewards = referred
    .filter(
      (user) =>
        user.payoutStatus !== "confirmed" &&
        user.reviewStatus !== "rejected" &&
        !user.refereeFlagged &&
        user.verification === "verified",
    )
    .reduce((sum, user) => sum + user.rewardAmount, 0);

  return {
    referrerHumanityId: humanityId,
    referralLink: `${window.location.origin}/?ref=${humanityId}`,
    humanityFlagged: humanityFlag,
    stats: {
      verifiedReferrals: referred.filter(
        (user) => user.verification === "verified",
      ).length,
      paidRewards,
      pendingRewards,
    },
    referred,
  };
};
