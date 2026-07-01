"use client";

import Identicon from "components/Identicon";
import CopyButton from "./CopyButton";

interface ReferralLinkRowProps {
  link: string;
  // Truncated text to show (the full `link` is still what gets copied).
  displayValue?: string;
  // Optional avatar shown before the label (used in the share modal).
  avatarAddress?: `0x${string}`;
}

const ReferralLinkRow: React.FC<ReferralLinkRowProps> = ({
  link,
  displayValue,
  avatarAddress,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    {avatarAddress && <Identicon address={avatarAddress} diameter={24} />}
    <span className="text-secondaryText whitespace-nowrap text-sm">
      My Referral Link:
    </span>
    <span className="text-orange min-w-0 flex-1 truncate text-sm font-medium">
      {displayValue ?? link}
    </span>
    <CopyButton value={link} variant="icon" />
  </div>
);

export default ReferralLinkRow;
