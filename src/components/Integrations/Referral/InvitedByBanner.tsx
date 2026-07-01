"use client";

import Identicon from "components/Identicon";
import ReferralIcon from "icons/Referral.svg";
import Image from "next/image";
import { safeIpfsUrl } from "utils/ipfs";

interface InvitedByBannerProps {
  inviterName: string;
  inviterAddress?: `0x${string}`;
  inviterPhoto?: string | null;
}

// Shown during registration / on the confirmation screen when the user arrived
// through a referral link. Surfaces who invited them and the referral bonus.
const InvitedByBanner: React.FC<InvitedByBannerProps> = ({
  inviterName,
  inviterAddress,
  inviterPhoto,
}) => {
  const photoUrl = safeIpfsUrl(inviterPhoto);

  return (
    <div className="border-stroke bg-grey/40 flex flex-col gap-2 rounded-card border p-5">
      <div className="text-orange flex items-center gap-2">
        <ReferralIcon className="h-5 w-auto" />
        <span className="font-semibold">Referral Bonus</span>
      </div>

      <div className="text-primaryText flex flex-wrap items-center gap-2">
        <span>You were invited by</span>
        {photoUrl ? (
          <Image
            alt={inviterName}
            src={photoUrl}
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover"
            unoptimized
          />
        ) : (
          inviterAddress && <Identicon address={inviterAddress} diameter={20} />
        )}
        <span className="font-semibold">{inviterName}</span>
      </div>

      <p className="text-secondaryText text-sm">
        Earn 100 PNK once you become verified — your inviter earns 250 PNK too.
        Great news: the referral rewards will be dropped directly into your
        wallet once they become claimable after the safety window.
      </p>
    </div>
  );
};

export default InvitedByBanner;
