"use client";

import WarningIcon from "icons/WarningCircle16.svg";
import { shortenReferralLink } from "data/referral";
import { ReferralData } from "types/referral";
import CopyButton from "./CopyButton";
import ReferralLinkRow from "./ReferralLinkRow";
import ReferralStatsBar from "./ReferralStatsBar";
import ReferredList from "./ReferredList";
import ShareButtons from "./ShareButtons";

const SHARE_MESSAGE =
  "Join Proof of Humanity, the registry of real humans, and claim your rewards:";

interface ReferralCardProps {
  data: ReferralData;
}

/**
 * Signed-in body of the referral card: link row, share actions, stats and the
 * referred list. The surrounding shell (icon, heading, intro copy) lives in
 * `ReferralDashboard`, which also renders it for signed-out states.
 */
const ReferralCard: React.FC<ReferralCardProps> = ({ data }) => {
  const { referralLink: link } = data;
  const hasReferrals = data.referred.length > 0;

  return (
    <>
      <div className="mt-5">
        <ReferralLinkRow
          link={link}
          displayValue={shortenReferralLink(link)}
          avatarAddress={data.referrerHumanityId}
          photo={data.referrerPhoto}
        />
      </div>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CopyButton value={link} />
        <ShareButtons link={link} message={SHARE_MESSAGE} />
      </div>

      {data.humanityFlagged && (
        <div className="border-status-challenged/30 bg-status-challenged/10 mt-5 flex items-start gap-3 rounded-card border p-4">
          <WarningIcon className="text-status-challenged mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-status-challenged text-sm font-semibold">
              Rewards on hold
            </p>
            <p className="text-secondaryText mt-1 text-sm">
              Your profile is under review. Referral payouts are paused until it
              clears — pending rewards stay reserved and pay out automatically
              after.
            </p>
          </div>
        </div>
      )}

      {data.stats && (
        <div className="mt-5">
          <ReferralStatsBar
            stats={data.stats}
            rewardsOnHold={data.humanityFlagged}
          />
        </div>
      )}

      {hasReferrals && (
        <div className="mt-6">
          <ReferredList users={data.referred} />
        </div>
      )}
    </>
  );
};

export default ReferralCard;
