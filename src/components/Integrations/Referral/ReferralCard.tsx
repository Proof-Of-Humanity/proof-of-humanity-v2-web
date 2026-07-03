"use client";

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
        />
      </div>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CopyButton value={link} />
        <ShareButtons link={link} message={SHARE_MESSAGE} />
      </div>

      {hasReferrals && (
        <>
          <div className="mt-5">
            <ReferralStatsBar stats={data.stats} />
          </div>

          {data.humanityFlagged && (
            <p className="text-status-rejected mt-3 text-sm">
              Your referral rewards are on hold pending a review of your
              account.
            </p>
          )}

          <div className="mt-6">
            <ReferredList users={data.referred} />
          </div>
        </>
      )}
    </>
  );
};

export default ReferralCard;
