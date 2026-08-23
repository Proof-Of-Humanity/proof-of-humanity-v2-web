import { getAuthedAtlasSdk } from "config/atlas";
import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import {
  PohReferralPayoutTransactionStatus,
  SortByTimeStamp,
} from "generated/atlas";
import {
  ReferralPage,
  ReferredUser,
  ReferredVerification,
  ReferrerSummary,
} from "types/referral";
import { formatUnits } from "viem";
import { getRegistrationPhoto } from "./evidence";

interface ReferrerProfile {
  humanityId: `0x${string}`;
  pendingRevocation: boolean;
  photo: string | null;
}

/** Finds the referrer's active registration across all supported chains; null if none.
 *  Throws on subgraph error so react-query shows the retry card, not a false "no humanity". */
const resolveReferrerProfile = async (
  referrerAccount: `0x${string}`,
): Promise<ReferrerProfile | null> => {
  const now = Math.floor(Date.now() / 1000);
  const registrationsPerChain = await Promise.all(
    supportedChains.map((chain) =>
      sdk[chain.id].ActiveRegistrationByClaimer({
        address: referrerAccount.toLowerCase(),
        now,
      }),
    ),
  );

  const registration = registrationsPerChain
    .flatMap((result) => result.registrations)
    .at(0);
  if (!registration) return null;

  const { humanity } = registration;
  const evidenceUri = humanity.winnerClaim[0]?.evidenceGroup.evidence[0]?.uri;
  return {
    humanityId: String(humanity.id).toLowerCase() as `0x${string}`,
    pendingRevocation: humanity.pendingRevocation,
    photo: await getRegistrationPhoto(evidenceUri),
  };
};

interface RefereeProfile {
  name?: string;
  photo?: string | null;
  chainId?: number;
  verification: ReferredVerification;
}

/** Resolves referee display profiles from the subgraphs; throws on error. */
const resolveRefereeProfiles = async (
  refereeHumanityIds: string[],
): Promise<Map<string, RefereeProfile>> => {
  const profilesByHumanityId = new Map<
    string,
    RefereeProfile & { evidenceUri?: string }
  >();
  if (refereeHumanityIds.length === 0) return profilesByHumanityId;

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  // A referee's humanity lives on a single chain, so ids don't collide across
  // subgraphs — we just gather every hit into one lookup keyed by humanity id.
  const humanitiesPerChain = await Promise.all(
    supportedChains.map(async (chain) =>
      (
        await sdk[chain.id].ReferralRefereeProfiles({ ids: refereeHumanityIds })
      ).humanities.map((humanity) => ({ chainId: chain.id, humanity })),
    ),
  );

  for (const { chainId, humanity } of humanitiesPerChain.flat()) {
    const { registration } = humanity;
    const latestClaim = humanity.latestClaimRequest[0];

    const isRegistered =
      registration && BigInt(registration.expirationTime) > nowSeconds;
    const claimRejected =
      latestClaim?.status.id === "resolved" &&
      latestClaim.winnerParty?.id === "challenger";
    // A won claim whose registration has since expired is still a completed
    // verification — not a review in progress.
    const claimWon =
      (latestClaim?.status.id === "resolved" &&
        latestClaim.winnerParty?.id === "requester") ||
      latestClaim?.status.id === "transferred";

    let verification: ReferredVerification;
    if (isRegistered)
      verification = humanity.pendingRevocation
        ? "revocation-pending"
        : "verified";
    else if (claimRejected) verification = "rejected";
    else if (claimWon) verification = "verified";
    else if (latestClaim?.status.id === "vouching")
      verification = "needs-vouch";
    else if (
      latestClaim?.status.id === "resolving" ||
      latestClaim?.status.id === "disputed"
    )
      verification = "in-review";
    // No live claim (never claimed, or withdrawn).
    else verification = "not-registered";

    profilesByHumanityId.set(String(humanity.id).toLowerCase(), {
      name:
        registration?.claimer.name?.trim() ||
        latestClaim?.claimer.name?.trim() ||
        undefined,
      chainId,
      verification,
      evidenceUri: latestClaim?.evidenceGroup.evidence[0]?.uri,
    });
  }

  await Promise.all(
    [...profilesByHumanityId.values()].map(async (profile) => {
      profile.photo = await getRegistrationPhoto(profile.evidenceUri);
    }),
  );

  return profilesByHumanityId;
};

const toPnk = (wei: string) => Number(formatUnits(BigInt(wei), 18));

export const REFERRALS_PAGE_SIZE = 10;

/** The signed-in user's referrer identity; null if they have no humanity. */
export const fetchReferrerSummary = async (
  address: `0x${string}`,
): Promise<ReferrerSummary | null> => {
  const referrerProfile = await resolveReferrerProfile(address);
  if (!referrerProfile) return null;
  return {
    humanityId: referrerProfile.humanityId,
    photo: referrerProfile.photo,
    referralLink: `${window.location.origin}/?ref=${referrerProfile.humanityId}`,
    pendingRevocation: referrerProfile.pendingRevocation,
  };
};

/** One page of the referred list (0-based) plus stats and the flag banner. */
export const fetchReferralPage = async (
  pageIndex: number,
): Promise<ReferralPage> => {
  const { humanityFlag, pohReferralStats, pohReferrals } =
    await getAuthedAtlasSdk().PohReferralDashboard({
      pagination: {
        skip: pageIndex * REFERRALS_PAGE_SIZE,
        take: REFERRALS_PAGE_SIZE,
        sortByTimeStamp: SortByTimeStamp.Desc,
      },
    });

  const referralRows = (pohReferrals.items ?? []).map(({ item }) => item);
  const refereeProfiles = await resolveRefereeProfiles(
    referralRows.map((referral) => referral.refereeHumanityId),
  );

  const referredUsers: ReferredUser[] = referralRows.map((referral) => {
    const refereeProfile = refereeProfiles.get(referral.refereeHumanityId);
    return {
      refereeHumanityId: referral.refereeHumanityId as `0x${string}`,
      name: refereeProfile?.name,
      photo: refereeProfile?.photo ?? null,
      chainId: refereeProfile?.chainId,
      reviewStatus: referral.reviewStatus,
      payoutStatus:
        referral.payoutTransaction?.status ??
        PohReferralPayoutTransactionStatus.NotSent,
      // Attribution can exist before the referee even starts a claim.
      verification: refereeProfile?.verification ?? "not-registered",
      refereeFlagged: referral.refereeFlag?.isFlagged ?? false,
      rewardAmount: toPnk(referral.rewardAmount),
      payoutTxHash: referral.payoutTransaction?.txHash ?? null,
    };
  });

  return {
    humanityFlagged: humanityFlag,
    stats: {
      verifiedReferrals: pohReferralStats.verifiedReferrals,
      paidRewards: toPnk(pohReferralStats.paidRewardsAmountInWei),
      pendingRewards: toPnk(pohReferralStats.pendingRewardsAmountInWei),
    },
    totalCount: pohReferrals.count,
    referred: referredUsers,
  };
};
