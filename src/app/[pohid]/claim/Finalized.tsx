import { ReactNode } from "react";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import ExternalLink from "components/ExternalLink";
import {
  PohIdReferenceRow,
  WalletReferenceRow,
} from "components/IdentityReferenceRow";
import GiftIcon from "icons/Gift.svg";
import HourglassIcon from "icons/Hourglass.svg";
import NeedsVouchIcon from "icons/NeedsVouch.svg";
import NewTabIcon from "icons/NewTab.svg";
import NotificationsIcon from "icons/Notifications.svg";
import ShieldIcon from "icons/Shield.svg";
import ShieldCheckIcon from "icons/ShieldCheck.svg";
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

/** One entry of the "Next steps" timeline. */
interface NextStep {
  key: string;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  link?: ReactNode;
}

const linkClassName = "inline-flex items-center gap-1.5 font-medium";

const glyphClassName = "h-5 w-5";
const shieldGlyphClassName = "h-[1.375rem] w-[1.375rem]";
const giftGlyphClassName = "h-[1.125rem] w-[1.125rem]";
const mailGlyphClassName = "h-[1.125rem] w-[1.125rem]";
const peachLinkClassName = `${linkClassName} hover:text-orange text-peach`;
const purpleLinkClassName = `${linkClassName} text-purple hover:opacity-80`;

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
    <div className="mt-8 flex w-full flex-col items-center gap-3">
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

const StepIcon: React.FC<{ children: ReactNode; color: string }> = ({
  children,
  color,
}) => (
  <span
    aria-hidden="true"
    className={`border-stroke bg-primaryBackground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color}`}
  >
    {children}
  </span>
);

const emailStep = (
  status: EmailSubmissionStatus,
  email?: string,
): NextStep | null => {
  const icon = (
    <StepIcon color="text-peach">
      <NotificationsIcon className={mailGlyphClassName} />
    </StepIcon>
  );
  const highlighted = (
    <span className="text-primaryText font-semibold">{email}</span>
  );

  switch (status) {
    case "saved":
      if (!email) return null;
      return {
        key: "email-saved",
        icon,
        title: "Verify Your Email",
        description: (
          <>
            We sent a verification link to {highlighted}. Check your inbox (and
            spam) to start receiving notifications about your profile.
          </>
        ),
      };
    case "skipped":
      return {
        key: "email-skipped",
        icon,
        title: "Enable Notifications",
        description:
          "No email is saved for this profile. Add one in settings to get notified about your profile status and any action you need to take.",
      };
    default:
      return null;
  }
};

const buildNextSteps = ({
  requiredVouches,
  challengePeriod,
  email,
  emailStatus,
  isRenewal,
}: {
  requiredVouches: number;
  challengePeriod: string;
  email?: string;
  emailStatus: EmailSubmissionStatus;
  isRenewal: boolean;
}): NextStep[] => {
  const steps: NextStep[] = [];
  const vouchNoun = requiredVouches === 1 ? "vouch" : "vouches";

  const emailEntry = emailStep(emailStatus, email);
  if (emailEntry) steps.push(emailEntry);

  steps.push({
    key: "deposit",
    icon: (
      <StepIcon color="text-secondaryText">
        <ShieldIcon className={shieldGlyphClassName} />
      </StepIcon>
    ),
    title: "Complete Your Deposit",
    description:
      "Make sure your registration deposit is fully funded. Your deposit is refunded after successful registration and may be forfeited if your profile is rejected after a challenge.",
  });

  if (requiredVouches > 0)
    steps.push({
      key: "vouch",
      icon: (
        <StepIcon color="text-status-vouching">
          <NeedsVouchIcon className={glyphClassName} />
        </StepIcon>
      ),
      title: "Get Vouched",
      description: `Receive at least ${requiredVouches} ${vouchNoun} from ${
        requiredVouches === 1 ? "a Verified Human" : "Verified Humans"
      }.`,
      link: (
        <ExternalLink
          href="https://t.me/proofhumanity"
          className={purpleLinkClassName}
        >
          Need help finding a voucher? Join the PoH community on Telegram
          <NewTabIcon className="h-3 w-3 shrink-0 fill-current" />
        </ExternalLink>
      ),
    });

  steps.push({
    key: "challenge-period",
    icon: (
      <StepIcon color="text-primaryText">
        <HourglassIcon className={glyphClassName} />
      </StepIcon>
    ),
    title: (
      <>
        Challenge Period{" "}
        <span className="text-orange">({challengePeriod})</span>
      </>
    ),
    description: `Once your deposit is fully funded${
      requiredVouches > 0
        ? ` and you've received the required ${vouchNoun}`
        : ""
    }, your profile enters a Challenge Period of ${challengePeriod}. During this time, the community can review and challenge your submission if it doesn't meet the Policy.`,
  });

  if (isRenewal) {
    steps.push({
      key: "complete-renewal",
      icon: (
        <StepIcon color="text-status-registered">
          <ShieldCheckIcon className={shieldGlyphClassName} />
        </StepIcon>
      ),
      title: "Complete Your Renewal",
      description:
        "If your renewal isn't successfully challenged during the Challenge Period, return to your profile after the timer ends to finalize it.",
    });
    return steps;
  }

  steps.push(
    {
      key: "verified",
      icon: (
        <StepIcon color="text-status-registered">
          <ShieldCheckIcon className={shieldGlyphClassName} />
        </StepIcon>
      ),
      title: "Become a Verified Human",
      description:
        "If your profile isn't successfully challenged during the Challenge Period, your registration can be finalized and you'll become a Verified Human.",
    },
    {
      key: "airdrop",
      icon: (
        <StepIcon color="text-orange">
          <GiftIcon className={giftGlyphClassName} />
        </StepIcon>
      ),
      title: "Claim Your PNK Airdrop",
      description: "Once verified, eligible users can claim their PNK reward.",
      link: (
        <Link href="/app/pnk-airdrop" className={peachLinkClassName}>
          View PNK Airdrop
          <NewTabIcon className="h-3 w-3 shrink-0 fill-current" />
        </Link>
      ),
    },
  );

  return steps;
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
  const steps = buildNextSteps({
    requiredVouches,
    challengePeriod,
    email,
    emailStatus,
    isRenewal,
  });

  return (
    <div className="my-8 flex w-full justify-center px-4 sm:px-0">
      <div className="paper w-full max-w-4xl px-5 py-8 sm:px-10 sm:py-10">
        <header className="flex flex-col items-center text-center">
          <h2 className="text-primaryText text-2xl font-semibold sm:text-3xl">
            <span aria-hidden="true">🎉</span>{" "}
            {isRenewal ? "Renewal" : "Registration"}{" "}
            <span className="text-orange">Submitted!</span>
          </h2>
          <p className="text-secondaryText mt-4 max-w-xl leading-relaxed sm:leading-8">
            {isRenewal
              ? "Your renewal request has been created and currently "
              : "Your profile has been created and currently "}
            <span className="bg-whiteBackground border-stroke inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 align-middle">
              <NeedsVouchIcon className="text-status-vouching h-4 w-4 shrink-0" />
              <span className="text-status-vouching text-sm">Needs Vouch</span>
            </span>
            <br />
            {isRenewal
              ? "Follow the steps below to complete your renewal."
              : "Follow the steps below to become a Verified Human."}
          </p>
        </header>

        <AccountIdRows pohId={pohId} />

        <section className="mt-10">
          <h3 className="text-primaryText text-center font-bold uppercase tracking-wider">
            Next Steps
          </h3>
          <div className="border-stroke mt-3 w-full border-b" />

          <ol className="mt-8 flex flex-col">
            {steps.map((step, i) => (
              <li
                key={step.key}
                className="relative grid grid-cols-[1.75rem_2.5rem_minmax(0,1fr)] items-start gap-x-3 pb-8 last:pb-0 sm:gap-x-4"
              >
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="border-stroke absolute bottom-1 left-[0.875rem] top-12 -translate-x-1/2 border-l border-dashed"
                  />
                )}
                <span className="flex h-10 items-center justify-center">
                  <span className="border-orange text-primaryBackground bg-orange flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold">
                    {i + 1}
                  </span>
                </span>
                {step.icon}
                <div className="col-start-3">
                  <h4 className="text-primaryText flex min-h-10 items-center font-semibold">
                    <span>{step.title}</span>
                  </h4>
                  <p className="text-secondaryText">{step.description}</p>
                  {step.link && <div className="mt-1.5">{step.link}</div>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="btn-primary min-w-[170px] rounded-full px-8 py-3 text-center text-base font-semibold text-white hover:opacity-90"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Finalized;
