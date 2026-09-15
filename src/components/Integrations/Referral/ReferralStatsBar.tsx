"use client";

import InfoTooltip from "components/InfoTooltip";
import { formatPnk } from "data/referralPresentation";
import { MonthlyPayoutUsage, ReferralStats } from "types/referral";

interface ReferralStatsBarProps {
  stats: ReferralStats;
  /** Omitted while loading or unavailable; the meter is then not rendered. */
  monthlyUsage?: MonthlyPayoutUsage;
  /** Referrer's humanity is flagged: payouts paused, mark pending as held. */
  rewardsOnHold?: boolean;
  /** Referrer is under the Humanity Court min stake. */
  needsStake?: boolean;
}

const Stat: React.FC<{
  label: string;
  /** Icon-only tooltip explaining the figure; sits beside the label. */
  hint?: React.ReactNode;
  value: string;
  tag?: React.ReactNode;
}> = ({ label, hint, value, tag }) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    <span className="text-secondaryText inline-flex items-center gap-1 text-xs">
      {label}
      {hint}
    </span>
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-primaryText whitespace-nowrap font-semibold">
        {value}
      </span>
      {tag}
    </span>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-status-challenged border-status-challenged/40 rounded-full border px-2 py-0.5 text-xs font-semibold">
    {children}
  </span>
);

/** `approximate` means only the latest 100 referrals were counted, so the
 *  real figure is at least `used`. */
const formatMonthlyUsage = ({ used, cap, approximate }: MonthlyPayoutUsage) =>
  `${used}${approximate && used < cap ? "+" : ""}/${cap}`;

const ReferralStatsBar: React.FC<ReferralStatsBarProps> = ({
  stats,
  monthlyUsage,
  rewardsOnHold,
  needsStake,
}) => (
  <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 text-sm lg:flex-row lg:items-center lg:gap-6">
    <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      <Stat
        label="Successful referrals"
        value={String(stats.verifiedReferrals)}
      />
      <Stat label="Total PNK earned" value={formatPnk(stats.paidRewards)} />
      <Stat
        label="Pending rewards"
        value={formatPnk(stats.pendingRewards)}
        tag={
          (rewardsOnHold && <Pill>On hold</Pill>) ||
          (needsStake && <Pill>Needs stake</Pill>)
        }
      />
      {monthlyUsage && (
        <Stat
          label="Payouts this month"
          hint={
            <InfoTooltip align="center" side="above">
              Up to {monthlyUsage.cap} referral payouts are released per
              calendar month (UTC). Referrals beyond the cap are held for review
              instead of being dropped.
            </InfoTooltip>
          }
          value={formatMonthlyUsage(monthlyUsage)}
          tag={
            monthlyUsage.used >= monthlyUsage.cap && <Pill>Cap reached</Pill>
          }
        />
      )}
    </div>
    <InfoTooltip
      align="center"
      side="above"
      className="shrink-0 self-end lg:self-auto"
      label={<span className="text-secondaryText">Auto Payouts</span>}
    >
      Rewards will be processed automatically
    </InfoTooltip>
  </div>
);

export default ReferralStatsBar;
