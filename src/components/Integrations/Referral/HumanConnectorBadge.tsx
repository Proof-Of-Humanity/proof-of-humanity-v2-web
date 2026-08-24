"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import { useQuery } from "@tanstack/react-query";
import {
  HUMAN_CONNECTOR_THRESHOLD,
  fetchVerifiedReferralCount,
} from "data/referral";
import HumanConnectorIcon from "icons/HumanConnector.svg";
import { Address } from "viem";
import { useAccount } from "wagmi";

export function HumanConnectorBadgeMark() {
  return (
    <div className="mt-8 flex w-[60px] flex-col items-center">
      <HumanConnectorIcon className="h-12 w-auto" />
      <span className="text-secondaryText text-center text-xs font-normal leading-[15px]">
        Human Connector
      </span>
    </div>
  );
}

/** Atlas referral stats are scoped to the signed-in user's JWT, so the badge
 *  can only be resolved (and shown) on the viewer's own profile. */
export default function HumanConnectorBadge({
  claimerId,
}: {
  claimerId: Address;
}) {
  const { address } = useAccount();
  const { isVerified: isSignedIn } = useAtlasProvider();
  const isOwnProfile =
    !!address && address.toLowerCase() === claimerId.toLowerCase();

  const { data: verifiedReferrals = 0 } = useQuery({
    // Keyed by the connected account: the count comes from that account's
    // JWT-scoped Atlas session, not from the viewed profile.
    queryKey: ["verified-referral-count", address],
    queryFn: fetchVerifiedReferralCount,
    enabled: isOwnProfile && isSignedIn,
  });

  if (
    !isOwnProfile ||
    !isSignedIn ||
    verifiedReferrals < HUMAN_CONNECTOR_THRESHOLD
  )
    return null;

  return <HumanConnectorBadgeMark />;
}
