"use client";

import InfoIcon from "icons/info.svg";
import { formatPnk } from "data/referral";
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
    <span className="text-primaryText font-bold">{value}</span>
    {tag}
  </div>
);

const Divider = () => (
  <span className="hidden h-4 w-px bg-white/35 sm:block" aria-hidden="true" />
);

const ReferralStatsBar: React.FC<ReferralStatsBarProps> = ({
  stats,
  rewardsOnHold,
}) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-[#2B303B] px-4 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:px-5">
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
    <div className="text-secondaryText border-stroke flex items-center gap-2 whitespace-nowrap rounded-full border bg-white/[0.02] px-4 py-1.5">
      <span>Auto Rewards</span>
      <span
        title="Rewards are credited automatically to your humanity's owner address."
        aria-label="Rewards are credited automatically to your humanity's owner address."
        className="inline-flex cursor-help"
      >
        <InfoIcon className="h-4 w-4 stroke-current stroke-2 opacity-90" />
      </span>
    </div>
  </div>
);

export default ReferralStatsBar;
