"use client";

import { shortenReferralLink } from "data/referralPresentation";
import CopyButton from "./CopyButton";
import ReferralAvatar from "./ReferralAvatar";

interface ReferralLinkRowProps {
  link: string;
  avatarAddress: `0x${string}`;
  evidenceUri: string | null;
}

const ReferralLinkRow: React.FC<ReferralLinkRowProps> = ({
  link,
  avatarAddress,
  evidenceUri,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <span className="shrink-0">
      <ReferralAvatar
        address={avatarAddress}
        evidenceUri={evidenceUri}
        alt="Your profile photo"
        diameter={24}
        className="h-6 w-6 rounded-full object-cover"
      />
    </span>
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

export default ReferralLinkRow;
