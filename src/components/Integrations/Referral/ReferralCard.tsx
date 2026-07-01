"use client";

import ReferralIcon from "icons/Referral.svg";
import { shortenReferralLink } from "data/referral";
import { ReferralData } from "types/referral";
import CopyButton from "./CopyButton";
import ReferralLinkRow from "./ReferralLinkRow";
import ReferralStatsBar from "./ReferralStatsBar";
import ReferredList from "./ReferredList";
import ShareButtons from "./ShareButtons";

interface ReferralCardProps {
  data: ReferralData;
}

/**
 * Referral feature card shown on the Rewards page. UI-only: all copy and data
 * come from `data` (see `data/referral.ts`) — no hardcoded text here.
 */
const ReferralCard: React.FC<ReferralCardProps> = ({ data }) => {
  const { referralLink: link, copy } = data;

  return (
    <div className="paper p-5 md:p-7">
      <div className="text-orange mb-4 flex items-center gap-2">
        <ReferralIcon className="h-8 w-auto" />
        <h2 className="text-xl font-semibold">{copy.title}</h2>
      </div>

      <h3 className="text-primaryText font-semibold">{copy.heading}</h3>
      <p className="text-secondaryText mt-1 max-w-3xl text-sm">{copy.body}</p>

      <div className="mt-5">
        <ReferralLinkRow
          link={link}
          displayValue={shortenReferralLink(link)}
          avatarAddress={data.referrerHumanityId}
        />
      </div>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CopyButton value={link} />
        <ShareButtons link={link} message={copy.shareMessage} />
      </div>

      <div className="mt-5">
        <ReferralStatsBar stats={data.stats} />
      </div>

      <div className="mt-6">
        <ReferredList users={data.referred} />
      </div>
    </div>
  );
};

export default ReferralCard;
