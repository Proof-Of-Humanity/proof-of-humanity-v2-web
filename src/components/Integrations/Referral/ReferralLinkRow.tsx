"use client";

import Image from "next/image";
import Identicon from "components/Identicon";
import { ipfs } from "utils/ipfs";
import CopyButton from "./CopyButton";

interface ReferralLinkRowProps {
  link: string;
  // Truncated text to show (the full `link` is still what gets copied).
  displayValue?: string;
  // Optional avatar shown before the label (used in the share modal).
  avatarAddress?: `0x${string}`;
  // Referrer's registration photo (IPFS path); falls back to the identicon.
  photo?: string | null;
}

const ReferralLinkRow: React.FC<ReferralLinkRowProps> = ({
  link,
  displayValue,
  avatarAddress,
  photo,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    {photo ? (
      <Image
        className="h-6 w-6 shrink-0 rounded-full object-cover"
        alt="Your profile photo"
        src={ipfs(photo)}
        width={24}
        height={24}
        unoptimized
      />
    ) : (
      avatarAddress && <Identicon address={avatarAddress} diameter={24} />
    )}
    <span className="text-secondaryText whitespace-nowrap text-sm">
      My Referral Link:
    </span>
    <span className="inline-flex min-w-0 flex-1 items-center gap-1">
      <span className="text-orange min-w-0 truncate text-sm font-medium">
        {displayValue ?? link}
      </span>
      <CopyButton value={link} variant="icon" className="shrink-0" />
    </span>
  </div>
);

export default ReferralLinkRow;
