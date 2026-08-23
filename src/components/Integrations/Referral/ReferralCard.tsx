"use client";

import cn from "classnames";
import WarningIcon from "icons/WarningCircle16.svg";
import { ReferralPage, ReferrerSummary } from "types/referral";
import CopyButton from "./CopyButton";
import PageNumbers from "./PageNumbers";
import ReferralLinkRow from "./ReferralLinkRow";
import ReferralStatsBar from "./ReferralStatsBar";
import ReferredList from "./ReferredList";
import ShareButtons from "./ShareButtons";

const SHARE_MESSAGE =
  "Join Proof of Humanity, the registry of real humans, and claim your rewards:";

const HoldNotice: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="border-status-challenged/30 bg-status-challenged/10 mt-5 flex items-start gap-3 rounded-card border p-4">
    <WarningIcon className="text-status-challenged mt-0.5 h-5 w-5 shrink-0" />
    <div>
      <p className="text-status-challenged text-sm font-semibold">{title}</p>
      <p className="text-secondaryText mt-1 text-sm">{children}</p>
    </div>
  </div>
);

interface ReferralCardProps {
  referrer: ReferrerSummary;
  referralPage: ReferralPage;
  /** 0-based index of the referred-list page being shown. */
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** A page switch is in flight; the stale list dims until it lands. */
  isPageLoading?: boolean;
}

/**
 * Signed-in body of the referral card: link row, share actions, stats and the
 * paged referred list. The surrounding shell (icon, heading, intro copy) lives
 * in `ReferralDashboard`, which also renders it for signed-out states.
 */
const ReferralCard: React.FC<ReferralCardProps> = ({
  referrer,
  referralPage,
  currentPage,
  pageCount,
  onPageChange,
  isPageLoading,
}) => {
  const { referralLink: link } = referrer;

  return (
    <>
      <div className="mt-5">
        <ReferralLinkRow
          link={link}
          avatarAddress={referrer.humanityId}
          photo={referrer.photo}
        />
      </div>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CopyButton value={link} />
        <ShareButtons link={link} message={SHARE_MESSAGE} />
      </div>

      {referralPage.humanityFlagged ? (
        <HoldNotice title="Rewards on hold">
          Your profile is under review. Referral payouts are paused until it
          clears — pending rewards stay reserved and pay out automatically
          after.
        </HoldNotice>
      ) : (
        referrer.pendingRevocation && (
          <HoldNotice title="Your registration is being challenged">
            A revocation request is pending against your profile. If it
            succeeds, referral payouts stop — pending rewards resume
            automatically if you keep your registration.
          </HoldNotice>
        )
      )}

      <div className="mt-5">
        <ReferralStatsBar
          stats={referralPage.stats}
          rewardsOnHold={referralPage.humanityFlagged}
        />
      </div>

      <div
        className={cn(
          "transition-opacity",
          isPageLoading && "pointer-events-none opacity-50",
        )}
      >
        <ReferredList users={referralPage.referred} />
      </div>
      <PageNumbers
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default ReferralCard;
