import { getAuthedAtlasSdk } from "config/atlas";
import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import {
  PohReferralPayoutTransactionStatus,
  PohReferralSortField,
  SortDirection,
} from "generated/atlas";
import {
  MonthlyPayoutUsage,
  ReferralPage,
  ReferredUser,
  ReferredRegistryStatus,
  ReferrerSummary,
} from "types/referral";
import { formatUnits } from "viem";
import { REFERRAL_MONTHLY_PAYOUT_CAP } from "./referralPresentation";

interface ReferrerProfile {
  humanityId: `0x${string}`;
  name?: string;
  pendingRevocation: boolean;
  evidenceUri?: string;
}

/** Throws on subgraph error so react-query shows the retry card, not a false
 *  "no humanity". */
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
  return {
    humanityId: String(humanity.id).toLowerCase() as `0x${string}`,
    name: humanity.winnerClaim[0]?.claimer.name?.trim() || undefined,
    pendingRevocation: humanity.pendingRevocation,
    evidenceUri: humanity.winnerClaim[0]?.evidenceGroup.evidence[0]?.uri,
  };
};

interface RefereeProfile {
  name?: string;
  evidenceUri?: string;
  chainId?: number;
  registryStatus: ReferredRegistryStatus;
}

const resolveRefereeProfiles = async (
  refereeHumanityIds: string[],
): Promise<Map<string, RefereeProfile>> => {
  const profilesByHumanityId = new Map<
    string,
    RefereeProfile & { liveliness: number }
  >();
  if (refereeHumanityIds.length === 0) return profilesByHumanityId;

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  // A transferred humanity appears on both subgraphs under the same id; the
  // dedupe below keeps whichever chain's record is most alive.
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
    const claimWon =
      (latestClaim?.status.id === "resolved" &&
        latestClaim.winnerParty?.id === "requester") ||
      latestClaim?.status.id === "transferred";
    // After a won claim, a lapsed registration entity stays behind while a
    // revoked one is deleted — that difference separates expired from removed.
    const registrationLapsed = Boolean(registration) && !isRegistered;
    const latestRemoval = humanity.latestRemovalRequest[0];
    const removedAfterLatestClaim =
      latestRemoval !== undefined &&
      (latestClaim === undefined ||
        BigInt(latestRemoval.creationTime) >= BigInt(latestClaim.creationTime));
    const transferredToAnotherChain =
      latestClaim?.status.id === "transferred" && !removedAfterLatestClaim;

    let registryStatus: ReferredRegistryStatus;
    if (isRegistered)
      registryStatus = humanity.pendingRevocation
        ? "revocation-pending"
        : "verified";
    else if (claimRejected) registryStatus = "rejected";
    else if (claimWon) {
      // A revocation dispute can outlive the registration's expiry; keep the
      // dispute (and its reward hold) visible until the request resolves.
      if (registrationLapsed)
        registryStatus = humanity.pendingRevocation
          ? "revocation-pending"
          : "expired";
      else if (transferredToAnotherChain) registryStatus = "verified";
      else registryStatus = "removed";
    } else if (latestClaim?.status.id === "vouching")
      registryStatus = "needs-vouch";
    else if (
      latestClaim?.status.id === "resolving" ||
      latestClaim?.status.id === "disputed"
    )
      registryStatus = "in-review";
    // No live claim (never claimed, or withdrawn).
    else registryStatus = "not-registered";

    // Rank how "alive" this chain's record is, so a transfer's stale source
    // entry never shadows the destination chain's record. A transferred-away
    // record is only a proxy for the destination chain, so it ranks lowest.
    const liveliness = isRegistered
      ? 2
      : transferredToAnotherChain
        ? 0
        : latestClaim
          ? 1
          : 0;
    const humanityKey = String(humanity.id).toLowerCase();
    const alreadyResolved = profilesByHumanityId.get(humanityKey);
    const resolvedProfile = {
      name:
        registration?.claimer.name?.trim() ||
        latestClaim?.claimer.name?.trim() ||
        undefined,
      chainId,
      registryStatus,
      evidenceUri: latestClaim?.evidenceGroup.evidence[0]?.uri,
      liveliness,
    };
    // Status follows the most-alive chain, but a bridged destination request
    // has no claim evidence of its own — name/evidence URI fall back to whichever
    // chain still holds the original claim metadata.
    if (alreadyResolved && alreadyResolved.liveliness >= liveliness) {
      alreadyResolved.name ??= resolvedProfile.name;
      alreadyResolved.evidenceUri ??= resolvedProfile.evidenceUri;
      continue;
    }
    if (alreadyResolved) {
      resolvedProfile.name ??= alreadyResolved.name;
      resolvedProfile.evidenceUri ??= alreadyResolved.evidenceUri;
    }
    profilesByHumanityId.set(humanityKey, resolvedProfile);
  }

  return profilesByHumanityId;
};

const toPnk = (wei: string) => Number(formatUnits(BigInt(wei), 18));

export const REFERRALS_PAGE_SIZE = 10;

export const HUMAN_CONNECTOR_THRESHOLD = 5;

/** Atlas referral reads are scoped to the caller's JWT, so this cannot
 *  resolve an arbitrary profile. */
export const fetchVerifiedReferralCount = async (): Promise<number> => {
  const { pohReferralStats } = await getAuthedAtlasSdk().PohReferralDashboard({
    pagination: { skip: 0, take: 1 },
  });
  return pohReferralStats.verifiedReferrals;
};

export const fetchMonthlyPayoutUsage =
  async (): Promise<MonthlyPayoutUsage> => {
    const { pohReferrals } = await getAuthedAtlasSdk().PohReferralDashboard({
      pagination: {
        skip: 0,
        take: 100,
        orderBy: PohReferralSortField.CreatedAt,
        orderDirection: SortDirection.Desc,
      },
    });
    const now = new Date();
    const monthStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const used = (pohReferrals.items ?? []).filter(
      ({ item }) =>
        item.payoutTransaction &&
        Date.parse(item.payoutTransaction.createdAt) >= monthStartMs,
    ).length;
    return {
      used,
      cap: REFERRAL_MONTHLY_PAYOUT_CAP,
      approximate: pohReferrals.count > 100,
    };
  };

export const fetchReferrerSummary = async (
  address: `0x${string}`,
): Promise<ReferrerSummary | null> => {
  const referrerProfile = await resolveReferrerProfile(address);
  if (!referrerProfile) return null;
  return {
    humanityId: referrerProfile.humanityId,
    name: referrerProfile.name,
    evidenceUri: referrerProfile.evidenceUri ?? null,
    referralLink: `${window.location.origin}/?ref=${referrerProfile.humanityId}`,
    pendingRevocation: referrerProfile.pendingRevocation,
  };
};

/** `pageIndex` is 0-based. */
export const fetchReferralPage = async (
  pageIndex: number,
): Promise<ReferralPage> => {
  const { humanityFlag, pohReferralStats, pohReferrals } =
    await getAuthedAtlasSdk().PohReferralDashboard({
      pagination: {
        skip: pageIndex * REFERRALS_PAGE_SIZE,
        take: REFERRALS_PAGE_SIZE,
        orderBy: PohReferralSortField.CreatedAt,
        orderDirection: SortDirection.Desc,
      },
    });

  const referralRows = (pohReferrals.items ?? []).map(({ item }) => ({
    ...item,
    refereeHumanityId: item.refereeHumanityId.toLowerCase(),
  }));
  const refereeProfiles = await resolveRefereeProfiles(
    referralRows.map((referral) => referral.refereeHumanityId),
  );

  const referredUsers: ReferredUser[] = referralRows.map((referral) => {
    const refereeProfile = refereeProfiles.get(referral.refereeHumanityId);
    return {
      refereeHumanityId: referral.refereeHumanityId as `0x${string}`,
      name: refereeProfile?.name,
      evidenceUri: refereeProfile?.evidenceUri ?? null,
      chainId: refereeProfile?.chainId,
      reviewStatus: referral.reviewStatus,
      payoutStatus:
        referral.payoutTransaction?.status ??
        PohReferralPayoutTransactionStatus.NotSent,
      // Attribution can exist before the referee even starts a claim.
      registryStatus: refereeProfile?.registryStatus ?? "not-registered",
      refereeFlagged: referral.refereeFlag?.isFlagged ?? false,
      createdAtMs: Date.parse(referral.createdAt),
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
