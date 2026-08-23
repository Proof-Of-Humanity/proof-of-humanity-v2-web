"use client";

import Image from "next/image";
import Identicon from "components/Identicon";
import { shortenReferralLink } from "data/referralPresentation";
import { safeIpfsUrl } from "utils/ipfs";
import CopyButton from "./CopyButton";

interface ReferralLinkRowProps {
  link: string;
  avatarAddress: `0x${string}`;
  // Referrer's registration photo (IPFS path); falls back to the identicon.
  photo: string | null;
}

const ReferralLinkRow: React.FC<ReferralLinkRowProps> = ({
  link,
  avatarAddress,
  photo,
}) => {
  // Evidence-sourced path; an invalid URI falls back to the identicon.
  const photoUrl = photo ? safeIpfsUrl(photo) : null;
  return (
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
        <Identicon address={avatarAddress} diameter={24} />
      )}
      <span className="text-secondaryText whitespace-nowrap text-sm">
        My Referral Link:
      </span>
      <span className="inline-flex min-w-0 flex-1 items-center gap-1">
        <span className="text-orange min-w-0 truncate text-sm font-medium">
          {shortenReferralLink(link)}
        </span>
        <CopyButton value={link} variant="icon" className="shrink-0" />
      </span>
    </div>
  );
};

export default ReferralLinkRow;
