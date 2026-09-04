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
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-secondaryText whitespace-nowrap">{label}:</span>
    <span className="text-primaryText whitespace-nowrap font-semibold">
      {value}
    </span>
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
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 overflow-visible rounded-2xl bg-white/[0.03] px-4 py-2 text-sm lg:flex-nowrap">
    <Stat
      label="Successful referrals"
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
    {/* TODO(referral): monthly cap meter ("Payouts this month: N/25" + "Cap
        reached" tag). The data layer is ready — `fetchMonthlyPayoutUsage` in
        data/referral.ts and the `MonthlyPayoutUsage` type — deliberately not
        rendered yet. When adding it back, keep the Stat wrappable so the tag
        can break to its own line on mobile. */}
    <Divider />
    <InfoTooltip
      align="center"
      side="above"
      className="ml-auto shrink-0"
      label={<span className="text-secondaryText">Auto Payouts</span>}
    >
      Rewards will be processed automatically
    </InfoTooltip>
  </div>
);

export default ReferralStatsBar;
