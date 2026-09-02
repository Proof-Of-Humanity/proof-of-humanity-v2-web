"use client";

import cn from "classnames";
import ExternalLink from "components/ExternalLink";
import type { StoredReferral } from "data/referralAttribution";
import ExternalLinkIcon from "icons/ExternalLink.svg";
import GnosisIcon from "icons/GnosisToken.svg";
import CloseIcon from "icons/MobileCancelMajor.svg";
import ReferralIcon from "icons/Referral.svg";
import Link from "next/link";
import { shortenAddress } from "utils/address";
import ReferralAvatar from "./ReferralAvatar";

const InvitedByBanner: React.FC<{
  referral: StoredReferral;
  onDismiss?: () => void;
  className?: string;
}> = ({ referral, onDismiss, className }) => {
  return (
    <div
      className={cn(
        "border-secondaryText bg-whiteBackground relative min-h-20 rounded-2xl border px-4 py-3.5 text-xs",
        className,
      )}
    >
      {onDismiss && (
        <button
          type="button"
          aria-label="Remove referral"
          className="text-secondaryText hover:text-orange absolute right-3 top-3 flex h-5 w-5 items-center justify-center"
          onClick={onDismiss}
        >
          <CloseIcon className="h-3 w-3 fill-current" />
        </button>
      )}

      <div className={cn("min-w-0", onDismiss && "pr-6")}>
        <div className="flex min-h-6 flex-wrap items-center gap-2">
          <span className="text-orange inline-flex items-center gap-1">
            <ReferralIcon className="h-6 w-[33px]" />
            Referral
          </span>
          <span className="text-secondaryText before:mr-2 before:content-['•']">
            You were invited by
          </span>
          <span className="inline-flex items-center gap-2">
            <ReferralAvatar
              address={referral.referrerHumanityId}
              evidenceUri={referral.evidenceUri}
              alt={referral.name}
              diameter={24}
              className="h-6 w-6 rounded-full object-cover"
            />
            <Link
              href={`/${referral.referrerHumanityId}`}
              target="_blank"
              className="text-primaryText hover:text-orange whitespace-nowrap transition-colors"
            >
              {referral.name}
            </Link>
          </span>
          <ExternalLink
            href={`https://gnosis.blockscout.com/address/${referral.referrerHumanityId}`}
            className="text-secondaryText hover:text-orange inline-flex items-center gap-2 whitespace-nowrap"
          >
            <GnosisIcon className="h-4 w-4" />
            {shortenAddress(referral.referrerHumanityId)}
            <ExternalLinkIcon className="h-4 w-4" />
          </ExternalLink>
        </div>
        <p className="text-secondaryText mt-1.5 leading-normal">
          Complete your PoH registration to become a verified human and claim
          your $PNK airdrop. First 10,000 claimers only.
        </p>
      </div>
    </div>
  );
};

export default InvitedByBanner;
