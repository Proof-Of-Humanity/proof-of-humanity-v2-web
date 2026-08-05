import { ReactNode } from "react";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import ExternalLink from "components/ExternalLink";
import {
  PohIdReferenceRow,
  WalletReferenceRow,
} from "components/IdentityReferenceRow";
import NeedsVouchIcon from "icons/NeedsVouch.svg";
import NewTabIcon from "icons/NewTab.svg";
import { explorerLink, idToChain } from "config/chains";
import { machinifyId, prettifyId } from "utils/identifier";
import { formatDuration } from "utils/time";
import { EmailSubmissionStatus } from "./Form";

interface FinalizedProps {
  requiredVouches: number;
  challengePeriodDuration: number;
  pohId: string;
  /** Notification email captured during the Info step, if any. */
  email?: string;
  emailStatus?: EmailSubmissionStatus;
  isRenewal: boolean;
}

const AccountIdRows: React.FC<{ pohId: string }> = ({ pohId }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chain = idToChain(chainId);
  // The URL param arrives both prettified (all internal links) and
  // 0x-prefixed; normalize before prettifying so we never double-strip.
  const machineId = machinifyId(pohId);
  const prettyPohId = machineId ? prettifyId(machineId) : pohId.toUpperCase();

  if (!address) return null;

  return (
    <div className="mt-8 flex w-full max-w-2xl flex-col items-center gap-3 lg:max-w-4xl">
      <span className="text-secondaryText">Your account and POH ID:</span>
      <WalletReferenceRow
        chainId={chainId}
        href={chain ? explorerLink(address, chain) : undefined}
        value={address}
        address={address}
      />
      <PohIdReferenceRow
        chainId={chainId}
        href={`/${prettyPohId}`}
        value={prettyPohId}
      />
    </div>
  );
};

const Finalized: React.FC<FinalizedProps> = ({
  requiredVouches,
  challengePeriodDuration,
  pohId,
  email,
  emailStatus = "idle",
  isRenewal,
}) => {
  const challengePeriod = formatDuration(challengePeriodDuration);

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
        Fully refunded after the request succeeds, or slashed if your profile is
        'Rejected' due to failure to follow our submission policy.
      </span>
    </div>,
    <div className="text-secondaryText">
      <span className="text-primaryText font-bold">
        Wait {challengePeriod}:
      </span>{" "}
      Once the above steps are done, a security timer starts.
    </div>,
    isRenewal ? (
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">Complete Renewal:</span>{" "}
        Return to your profile after the timer ends to finalize the renewal.
      </div>
    ) : (
      <div className="text-secondaryText">
        <span className="text-primaryText font-bold">Claim:</span> Return to
        your profile to register it, and claim your airdrop{" "}
        <Link
          href={`/app/pnk-airdrop`}
          className="text-orange font-semibold hover:text-orange-400"
        >
          here.
        </Link>
      </div>
    ),
  );

  return (
    <div className="text-primaryText my-8 flex w-full flex-col items-center">
      <div className="text-center text-2xl font-normal">
        {isRenewal ? (
          <span>Renewal request submitted</span>
        ) : (
          <span>
            🎉 Welcome to{" "}
            <strong className="font-semibold text-peach">
              Proof of Humanity
            </strong>{" "}
            🎉
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-lg">
        {isRenewal
          ? "Your renewal request starts with the status:"
          : "Your profile starts with the status:"}
        <span className="bg-whiteBackground border-stroke flex items-center gap-2 rounded-full border px-3 py-2">
          <NeedsVouchIcon className="text-status-vouching h-4 w-4 shrink-0" />
          <span className="text-status-vouching text-sm">Needs Vouch</span>
        </span>
      </div>

      <AccountIdRows pohId={pohId} />

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
        className="btn-primary mx-auto min-w-[170px] px-8 py-3 text-center text-base font-semibold text-white hover:opacity-90"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export default Finalized;
