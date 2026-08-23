"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import { useQuery } from "@tanstack/react-query";
import cn from "classnames";
import {
  fetchReferrerSummary,
  fetchVerifiedReferralCount,
} from "data/referral";
import ReferralIcon from "icons/Referral.svg";
import { Address } from "viem";
import { useAccount } from "wagmi";
import ReferralLinkRow from "./ReferralLinkRow";

export default function InviteHumansBanner({
  claimerId,
  className,
}: {
  claimerId: Address;
  className?: string;
}) {
  const { address } = useAccount();
  const { isVerified: isSignedIn } = useAtlasProvider();
  const isOwnProfile =
    !!address && address.toLowerCase() === claimerId.toLowerCase();

  const { data: referrer = null } = useQuery({
    queryKey: ["referrer-summary", address?.toLowerCase()],
    queryFn: () => fetchReferrerSummary(address as `0x${string}`),
    enabled: isOwnProfile,
  });

  const { data: verifiedInvites } = useQuery({
    queryKey: ["verified-referral-count", address?.toLowerCase()],
    queryFn: fetchVerifiedReferralCount,
    enabled: isOwnProfile && isSignedIn,
  });

  if (!isOwnProfile || !referrer) return null;

  return (
    <div
      className={cn(
        "border-secondaryText bg-whiteBackground rounded-2xl border px-4 py-3.5 text-xs",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-orange inline-flex items-center gap-1">
          <ReferralIcon className="h-6 w-[33px]" />
          Referral
        </span>
        <span className="text-orange before:mr-2 before:content-['•']">
          Invite Humans
        </span>
        <span className="text-secondaryText">
          Earn PNK when people you invite become verified.
        </span>
        <div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-x-3 gap-y-2 sm:basis-auto sm:justify-end">
          <ReferralLinkRow
            link={referrer.referralLink}
            avatarAddress={referrer.humanityId}
            photo={referrer.photo}
          />
          {verifiedInvites !== undefined && (
            <span className="text-secondaryText whitespace-nowrap">
              <span className="mr-3">|</span>
              Verified invites:{" "}
              <span className="text-primaryText font-semibold">
                {verifiedInvites}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
