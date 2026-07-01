import { ReactNode } from "react";
import Link from "next/link";
import ExternalLink from "components/ExternalLink";
import InvitedByBanner from "components/Integrations/Referral/InvitedByBanner";
import type { StoredReferral } from "data/referralAttribution";
import NewTabIcon from "icons/NewTab.svg";
import { EmailSubmissionStatus } from "./Form";

interface FinalizedProps {
  requiredVouches: number;
  challengePeriodDuration: number;
  pohId: string;
  // Set when the user registered through a referral link.
  invitedBy?: StoredReferral | null;
  /** Notification email captured during the Info step, if any. */
  email?: string;
  emailStatus?: EmailSubmissionStatus;
}

const Finalized: React.FC<FinalizedProps> = ({
  requiredVouches,
  challengePeriodDuration,
  pohId,
  invitedBy,
  email,
  emailStatus = "idle",
}) => {
  const days = challengePeriodDuration / 86400;

  // Built as an array so the visible numbering stays correct regardless of
  // which conditional steps (verify email, get vouched) are present.
  const steps: ReactNode[] = [];

  if (email && emailStatus === "saved")
    steps.push(
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">Verify your email:</span>{" "}
        We sent a verification link to{" "}
        <span className="text-primaryText font-semibold">{email}</span>. Check
        your inbox (and spam) to start receiving notifications about your
        profile.
      </div>,
    );
  else if (email && emailStatus === "unchanged")
    steps.push(
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">
          Notifications enabled:
        </span>{" "}
        <span className="text-primaryText font-semibold">{email}</span> is
        already saved for profile notifications. If it is not verified yet, you
        can resend the verification email from settings.
      </div>,
    );
  else if (email && emailStatus === "skipped")
    steps.push(
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">
          Enable notifications:
        </span>{" "}
        You can save and verify{" "}
        <span className="text-primaryText font-semibold">{email}</span> from
        settings to receive profile status and action notifications.
      </div>,
    );

  if (requiredVouches > 0)
    steps.push(
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">Get Vouched:</span> Ask a
        registered human to vouch for you.{" "}
        <ExternalLink
          href="https://t.me/proofhumanity"
          className="text-orange inline-flex items-center gap-1 whitespace-nowrap font-semibold hover:text-orange-400"
        >
          Get a vouch
          <NewTabIcon className="fill-orange" width={12} height={12} />
        </ExternalLink>
      </div>,
    );

  steps.push(
    <div className="text-secondaryText">
      <span className="text-primaryText font-bold">Fund Deposit:</span> Submit
      your full security deposit (if not done already).{" "}
      <span className="text-secondaryText text-sm">
        Fully refunded once you attain the 'Verified Human' status, or slashed
        if your profile is 'Rejected' due to failure to follow our submission
        policy.
      </span>
    </div>,
    <div className="text-secondaryText">
      <span className="text-primaryText font-bold">Wait {days} Days:</span> Once
      the above steps are done, a security timer starts.
    </div>,
    <div className="text-secondaryText">
      <span className="text-primaryText font-bold">Claim:</span> Return to your
      profile to register it, and claim your airdrop{" "}
      <Link
        href={`/app/pnk-airdrop`}
        className="text-orange font-semibold hover:text-orange-400"
      >
        here.
      </Link>
    </div>,
  );

  return (
    <div className="text-primaryText my-8 flex w-full flex-col items-center">
      <div className="text-center text-2xl font-normal">
        <span>
          🎉 Welcome to
          <strong className="ml-2 font-semibold uppercase">
            Proof of Humanity
          </strong>
          🎉
        </span>
      </div>

      {invitedBy && (
        <div className="mt-6 w-full max-w-2xl">
          <InvitedByBanner
            inviterName={invitedBy.name}
            inviterAddress={invitedBy.referrerHumanityId}
            inviterPhoto={invitedBy.photo}
          />
        </div>
      )}

      <div className="mt-6 flex items-center text-lg">
        Your profile starts with the status:
        <span className="bg-status-vouching ml-2 rounded-full px-3 py-1 text-base font-semibold text-white">
          Needs Vouch
        </span>
      </div>

      <div className="my-8 flex w-full max-w-2xl flex-col lg:max-w-4xl">
        <div className="mb-6 flex flex-col items-center">
          <h3 className="text-primaryText mb-2 font-bold uppercase tracking-wider">
            Next Steps
          </h3>
          <div className="border-stroke w-full border-b px-2" />
        </div>

        <div className="flex flex-col space-y-6 text-left">
          {steps.map((content, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-secondaryText">{i + 1}.</span>
              {content}
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/"
        className="btn-primary w-full py-3 text-center text-lg font-bold text-white hover:opacity-90"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export default Finalized;
