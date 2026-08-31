"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import { useQuery } from "@tanstack/react-query";
import cn from "classnames";
import Image from "next/image";
import CopyButton from "components/CopyButton";
import Identicon from "components/Identicon";
import {
  fetchReferrerSummary,
  fetchVerifiedReferralCount,
} from "data/referral";
import ReferralIcon from "icons/Referral.svg";
import { ReferrerSummary } from "types/referral";
import { safeIpfsUrl } from "utils/ipfs";
import { Address } from "viem";
import { useAccount } from "wagmi";

export function InviteHumansBannerView({
  referrer,
  verifiedInvites,
  className,
}: {
  referrer: ReferrerSummary;
  verifiedInvites?: number;
  className?: string;
}) {
  const photoUrl = safeIpfsUrl(referrer.photo);

  return (
    <div
      className={cn(
        "border-secondaryText bg-whiteBackground flex min-h-14 items-center rounded-2xl border px-4 py-3 text-xs",
        className,
      )}
    >
      <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-2 md:flex-nowrap">
        <span className="text-orange inline-flex items-center gap-1">
          <ReferralIcon className="h-6 w-[33px]" />
          Referral
        </span>
        <span className="text-secondaryText before:mr-2 before:content-['•']">
          Invite Humans -
        </span>
        <span className="text-primaryText">
          Earn PNK when people you invite become verified.
        </span>
        <div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-x-6 gap-y-2 md:basis-auto md:flex-nowrap md:justify-end">
          <div className="flex min-w-0 items-center gap-2">
            {photoUrl ? (
              <Image
                className="h-6 w-6 shrink-0 rounded-full object-cover"
                alt="Your profile photo"
                src={photoUrl}
                width={24}
                height={24}
                unoptimized
              />
            ) : (
              <span className="shrink-0">
                <Identicon address={referrer.humanityId} diameter={24} />
              </span>
            )}
            <span className="text-primaryText max-w-32 truncate whitespace-nowrap">
              {referrer.name || "Your profile"}
            </span>
            <span className="text-orange inline-flex shrink-0 items-center gap-2 text-sm">
              Invite &amp; Earn
              <CopyButton
                value={referrer.referralLink}
                label="Copy Link"
                className="[&_button]:!text-orange"
              />
            </span>
          </div>
          {verifiedInvites !== undefined && (
            <span className="text-secondaryText whitespace-nowrap">
              <span className="mr-6">|</span>
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
    <InviteHumansBannerView
      referrer={referrer}
      verifiedInvites={verifiedInvites}
      className={className}
    />
  );
}
