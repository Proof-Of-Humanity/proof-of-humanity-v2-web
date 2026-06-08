import React from "react";
import InfoIcon from "icons/info.svg";

interface EmailVerificationNoticeProps {
  /** True when the resend cooldown has elapsed and resending is allowed. */
  canResend: boolean;
  isBusy: boolean;
  minutesUntilUpdateable: number;
  onResend: () => void;
}

const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({
  canResend,
  isBusy,
  minutesUntilUpdateable,
  onResend,
}) => (
  <div
    className="text-secondaryText mt-2 flex animate-fadeIn items-start justify-center gap-2 text-center text-sm"
    role="alert"
  >
    <InfoIcon className="mt-1 h-4 w-4 shrink-0 stroke-orange-400" />
    <span>
      We sent you a verification email. Please, verify it. Didn&apos;t receive
      the email?{" "}
      {canResend ? (
        <button
          onClick={onResend}
          disabled={isBusy}
          className="text-orange underline transition-colors duration-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Sending..." : "Resend"}
        </button>
      ) : (
        <span className="text-secondaryText">
          Please wait {minutesUntilUpdateable}{" "}
          {minutesUntilUpdateable === 1 ? "minute" : "minutes"} before resending
        </span>
      )}
    </span>
  </div>
);

export default EmailVerificationNotice;
