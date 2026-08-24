"use client";

import InfoTooltip from "components/InfoTooltip";
import { formatPnk } from "data/referralPresentation";
import { ReferralStats } from "types/referral";

interface ReferralStatsBarProps {
  stats: ReferralStats;
  /** Referrer's humanity is flagged: payouts paused, mark pending as held. */
  rewardsOnHold?: boolean;
}

const Stat: React.FC<{
  label: string;
  value: string;
  tag?: React.ReactNode;
}> = ({ label, value, tag }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    <span className="text-secondaryText">{label}:</span>
    <span className="text-primaryText font-semibold">{value}</span>
    {tag}
  </div>
);

const Divider = () => (
  <span className="text-secondaryText hidden lg:block" aria-hidden="true">
    |
  </span>
);

const ReferralStatsBar: React.FC<ReferralStatsBarProps> = ({
  stats,
  rewardsOnHold,
}) => (
  <div className="flex flex-nowrap items-center gap-x-4 overflow-visible rounded-2xl bg-white/[0.03] px-4 py-2 text-sm">
    <Stat
      label="Total verified referrals"
      value={String(stats.verifiedReferrals)}
    />
    <Divider />
    <Stat label="Total PNK earned" value={formatPnk(stats.paidRewards)} />
    <Divider />
    <Stat
      label="Pending rewards"
      value={formatPnk(stats.pendingRewards)}
      tag={
        rewardsOnHold && (
          <span className="text-status-challenged border-status-challenged/40 rounded-full border px-2 py-0.5 text-xs font-semibold">
            On hold
          </span>
        )
      }
    />
    <Divider />
    <InfoTooltip
      align="center"
      side="above"
      className="border-stroke bg-whiteBackground ml-auto shrink-0 rounded-full border px-4 py-2"
      label={<span className="text-secondaryText">Auto Rewards</span>}
    >
      Rewards will be processed automatically
    </InfoTooltip>
  </div>
);

export default ReferralStatsBar;
