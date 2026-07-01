"use client";

import InfoIcon from "icons/info.svg";
import { formatPnk } from "data/referral";
import { ReferralStats } from "types/referral";

interface ReferralStatsBarProps {
  stats: ReferralStats;
}

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5 whitespace-nowrap">
    <span className="text-secondaryText">{label}:</span>
    <span className="text-primaryText font-semibold">{value}</span>
  </div>
);

const Divider = () => (
  <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden="true" />
);

const ReferralStatsBar: React.FC<ReferralStatsBarProps> = ({ stats }) => (
  <div className="bg-grey flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-5 py-3.5 text-sm">
    <Stat
      label="Total verified referrals"
      value={String(stats.verifiedReferrals)}
    />
    <Divider />
    <Stat label="Total PNK earned" value={formatPnk(stats.paidRewards)} />
    <Divider />
    <Stat label="Pending rewards" value={formatPnk(stats.pendingRewards)} />
    <Divider />
    <div className="text-secondaryText flex items-center gap-1.5 whitespace-nowrap">
      <span>Auto Rewards</span>
      <span
        title="Referral rewards are paid out automatically once they become claimable after the safety window."
        aria-label="Referral rewards are paid out automatically once they become claimable after the safety window."
        className="inline-flex cursor-help"
      >
        <InfoIcon className="h-4 w-4 stroke-current stroke-2" />
      </span>
    </div>
  </div>
);

export default ReferralStatsBar;
