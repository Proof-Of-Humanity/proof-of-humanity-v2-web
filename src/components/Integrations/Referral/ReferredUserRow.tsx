"use client";

import Image from "next/image";
import Link from "next/link";
import cn from "classnames";
import Identicon from "components/Identicon";
import GnosisToken from "icons/GnosisToken.svg";
import NewTabIcon from "icons/NewTab.svg";
import NeedsVouchIcon from "icons/NeedsVouch.svg";
import EyeIcon from "icons/Eye.svg";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline.svg";
import { VERIFICATION_META, deriveStep } from "data/referral";
import { ReferredUser, ReferredVerification } from "types/referral";
import { shortenAddress } from "utils/address";
import { ipfs } from "utils/ipfs";
import { prettifyId } from "utils/identifier";
import ReferralSteps from "./ReferralSteps";

interface ReferredUserRowProps {
  user: ReferredUser;
}

const VERIFICATION_ICON: Record<
  ReferredVerification,
  React.FC<React.SVGAttributes<SVGElement>>
> = {
  "needs-vouch": NeedsVouchIcon,
  "in-review": EyeIcon,
  verified: CheckCircleOutlineIcon,
};

const ReferredUserRow: React.FC<ReferredUserRowProps> = ({ user }) => {
  const status = VERIFICATION_META[user.verification];
  const StatusIcon = VERIFICATION_ICON[user.verification];
  const displayName = user.name ?? shortenAddress(user.refereeHumanityId);

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {user.photo ? (
            <Image
              className="h-6 w-6 shrink-0 rounded-full object-cover"
              alt={displayName}
              src={ipfs(user.photo)}
              width={24}
              height={24}
              unoptimized
            />
          ) : (
            <Identicon address={user.refereeHumanityId} diameter={24} />
          )}
          <span className="text-primaryText font-semibold">{displayName}</span>
          <Link
            href={`/${prettifyId(user.refereeHumanityId)}`}
            className="text-secondaryText hover:text-primaryText inline-flex items-center gap-1.5 text-sm transition-colors"
            aria-label={`View ${displayName}'s profile`}
          >
            {user.chainId && <GnosisToken className="h-4 w-4" />}
            {shortenAddress(user.refereeHumanityId)}
            <span className="border-stroke flex h-[18px] w-[18px] items-center justify-center rounded-md border">
              <NewTabIcon className="fill-secondaryText h-2.5 w-2.5" />
            </span>
          </Link>
        </div>
        <ReferralSteps active={deriveStep(user)} />
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold",
          status.text,
        )}
        aria-label={`Status: ${status.label}`}
      >
        <StatusIcon className="h-4 w-4" aria-hidden="true" />
        {status.label}
      </div>
    </div>
  );
};

export default ReferredUserRow;
