"use client";
import React, { useState, useMemo, useCallback } from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";

import ActionButton from "components/ActionButton";
import LawBalance from "icons/LawBalance.svg";
import Field from "components/Field";
import Hourglass from "icons/Hourglass.svg";

export type EmailVerificationStatus = "unsubscribed" | "pending" | "verified";

export interface EmailNotificationsProps {
  onSubscribe?: (email: string) => void;
  onResendEmail?: () => void;
  isLoading?: boolean;
  verificationStatus?: EmailVerificationStatus;
  subscribedEmail?: string;
}

const EmailNotifications: React.FC<EmailNotificationsProps> = ({
  onSubscribe,
  onResendEmail,
  isLoading = false,
  verificationStatus = "unsubscribed",
  subscribedEmail,
}) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = useCallback(() => {
    if (email && onSubscribe) {
      onSubscribe(email);
    }
  }, [email, onSubscribe]);

  const handleResendEmail = useCallback(() => {
    if (onResendEmail) {
      onResendEmail();
    }
  }, [onResendEmail]);

  const emailFieldProps = useMemo(() => {
    switch (verificationStatus) {
      case "pending":
      case "verified":
        return {
          value: subscribedEmail || "",
          disabled: true,
          onChange: undefined as any,
        };
      default: // "unsubscribed"
        return {
          value: email,
          onChange: (e: any) => setEmail(e.target.value),
          disabled: isLoading,
        };
    }
  }, [verificationStatus, subscribedEmail, email, isLoading]);

  const buttonProps = useMemo(() => {
    switch (verificationStatus) {
      case "pending":
      case "verified":
        return {
          onClick: () => {},
          label: "Save",
          disabled: true,
          isLoading: false,
        };
      default: // "unsubscribed"
        return {
          onClick: handleSubscribe,
          label: "Subscribe",
          disabled: !email || isLoading,
          isLoading: isLoading,
        };
    }
  }, [verificationStatus, handleSubscribe, email, isLoading]);

  const renderNotification = () => {
    switch (verificationStatus) {
      case "pending":
        return (
          <div className="flex items-center gap-2">
            <Hourglass width={16} height={16} className="fill-purple flex-shrink-0" />
            <div>
              <span className="text-primaryText text-sm font-medium">Email Verification Pending</span>
              <div className="text-secondaryText text-sm">
                We sent you a verification email. Please, verify it.Didn't receive the email?{" "}
                <button
                  onClick={handleResendEmail}
                  className="text-purple underline hover:no-underline"
                  disabled={isLoading}
                >
                  Resend it
                </button>
              </div>
            </div>
          </div>
        );

      case "verified":
        return (
          <div className="flex items-center gap-2">
            <CheckCircleIcon width={16} height={16} className="fill-green-500 flex-shrink-0" />
            <span className="text-primaryText text-sm font-medium">
              Congratulations :) Your email has been verified!
            </span>
          </div>
        );

      default: // "unsubscribed"
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#BE75FF] to-[#F9BFCE]">
      <div className="rounded-[29px] bg-primaryBackground p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <LawBalance />
          <span className="text-purple text-sm font-medium">
            Congratulations! Now, you are staked on Humanity court!
          </span>
        </div>

        {/* Title */}
        <h2 className="text-primaryText text-2xl font-semibold mb-4">
          Don't forget to subscribe for notifications!
        </h2>

        {/* Description */}
        <p className="text-primaryText text-sm mb-4 leading-relaxed">
          We'll remind you when your actions are required on the Humanity court, and send you notifications on key moments to help you achieve the best of Kleros.
        </p>
        
        <p className="text-secondaryText text-sm mb-6 leading-relaxed">
          Why Subscribe? Because missing a juror draw means missing rewards, reputation, and your chance to help shape decentralized justice.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 mt-2">
            <CheckCircleIcon width={16} height={16} className="fill-purple mt-1 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-primaryText text-base">
                Get a heads-up the moment you're drawn as a juror. No more missed cases, no more lost rewards.
              </span>
              <div className="text-primaryText text-base">
                The email address is used exclusively for notifications.
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <CheckCircleIcon width={16} height={16} className="fill-purple mt-0.5 flex-shrink-0" />
            <span className="text-primaryText text-base">
              Voting on time = getting paid.
            </span>
          </div>
        </div>

        {/* Email Section - varies by verification status */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-orange text-sm font-medium mb-2 uppercase">
              EMAIL
            </label>
            <div className="flex flex-col sm:flex-row">
              <Field
                id="email"
                type="email"
                {...emailFieldProps}
                placeholder="myemail@email.com"
                className="flex-1 px-4 py-3 border-2 border-orange rounded-lg text-primaryText placeholder-secondaryText focus:outline-none focus:border-purple"
              />
              <ActionButton
                {...buttonProps}
                className="sm:w-auto px-8"
                variant="primary"
              />
            </div>
          </div>
          
          {renderNotification()}
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;