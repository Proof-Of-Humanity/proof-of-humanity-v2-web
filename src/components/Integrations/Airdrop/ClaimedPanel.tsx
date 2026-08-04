"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAtlasProvider } from "@kleros/kleros-app";

import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import SignInButton from "components/SignInButton";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import PnkDisplay from "components/Integrations/Airdrop/PnkDisplay";
import JurorAlertsModal from "components/Integrations/Airdrop/JurorAlertsModal";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";

import CheckCircleMinorIcon from "icons/CheckCircleMinor.svg";
import CheckCircleIcon from "icons/CheckCircle.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import NewTabIcon from "icons/NewTab.svg";

import { isValidEmailAddress } from "utils/validators";

interface ClaimedPanelProps {
  amountPerClaim: bigint;
  isTestnet: boolean;
}

export default function ClaimedPanel({
  amountPerClaim,
  isTestnet,
}: ClaimedPanelProps) {
  const router = useRouter();
  const { isVerified, user, isFetchingUser, isAddingUser, isUpdatingUser } =
    useAtlasProvider();

  const [userEmail, setUserEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const trimmedEmail = userEmail.trim();
  const isEmailValid =
    trimmedEmail.length === 0 ? true : isValidEmailAddress(trimmedEmail);

  const hasEmail = !!user?.email;
  const isEmailVerified = user?.isEmailVerified ?? false;
  const parsedEmailUpdateableAt = user?.emailUpdateableAt
    ? new Date(user.emailUpdateableAt)
    : null;
  const emailUpdateableAt =
    parsedEmailUpdateableAt && !Number.isNaN(parsedEmailUpdateableAt.getTime())
      ? parsedEmailUpdateableAt
      : null;
  const canUpdateEmail = !emailUpdateableAt || new Date() >= emailUpdateableAt;
  const minutesUntilUpdateable =
    emailUpdateableAt && !canUpdateEmail
      ? Math.max(
          1,
          Math.round((emailUpdateableAt.getTime() - Date.now()) / 60000),
        )
      : 0;

  const alertsEnabled = hasEmail && isEmailVerified;
  const alertsPending = hasEmail && !isEmailVerified;
  const showForm = !hasEmail || isEditing;

  useEffect(() => {
    if (isVerified && !isFetchingUser && !hasEmail) {
      setShowModal(true);
    }
  }, [isVerified, isFetchingUser, hasEmail]);

  const { mutate: submitEmail, isPending: isSubmitting } = useSubmitEmail({
    onSuccess: () => {
      setUserEmail("");
      setIsEditing(false);
    },
  });

  const handleSubmitEmail = useCallback(() => {
    if (!trimmedEmail) {
      toast.info("Please enter a valid email");
      return;
    }
    submitEmail({ nextEmail: trimmedEmail });
  }, [trimmedEmail, submitEmail]);

  const handleResendVerification = useCallback(() => {
    if (!user?.email) return;
    submitEmail({ nextEmail: user.email, isResend: true });
  }, [user?.email, submitEmail]);

  const handleStartEditing = useCallback(() => {
    setUserEmail(user?.email ?? "");
    setIsEditing(true);
  }, [user?.email]);

  const handleCancelEditing = useCallback(() => {
    setUserEmail("");
    setIsEditing(false);
  }, []);

  const isBusy =
    isSubmitting || isAddingUser || isUpdatingUser || isFetchingUser;

  const stepBadge = !isVerified
    ? { label: "Sign In", className: "bg-grey text-purple" }
    : alertsEnabled
      ? { label: "Enabled", className: "badge-success" }
      : alertsPending
        ? { label: "Unverified", className: "bg-lightOrange text-orange" }
        : { label: "Pending", className: "bg-lightOrange text-orange" };

  return (
    <>
      <div className="mb-4 flex justify-center">
        <CheckCircleMinorIcon width={64} height={64} />
      </div>
      <div className="text-status-registered mb-1 text-sm font-medium">
        Success!
      </div>
      <PnkDisplay amount={amountPerClaim} />
      <div className="text-secondaryText -mt-5 mb-2 text-sm">
        Claimed &amp; Staked on Humanity court
      </div>
      {isTestnet && (
        <div className="text-secondaryText mb-4 text-xs">
          On testnet, you will be staked in the General Court.
        </div>
      )}

      <div className="border-stroke mb-3 rounded-2xl border p-3 text-left">
        <div className="flex items-center gap-1">
          <CheckCircleIcon
            width={22}
            height={22}
            className="text-status-registered mt-1 flex-shrink-0"
          />
          <span className="text-primaryText text-sm font-medium">
            Claimed &amp; Staked
          </span>
        </div>

        <div className="flex items-center gap-1">
          {alertsEnabled ? (
            <CheckCircleIcon
              width={22}
              height={22}
              className="text-status-registered mt-1 flex-shrink-0"
            />
          ) : !isVerified ? (
            <WarningCircle16Icon
              width={22}
              height={22}
              className="fill-purple mt-1 flex-shrink-0"
            />
          ) : (
            <WarningCircle16Icon
              width={22}
              height={22}
              className="fill-orange mt-1 flex-shrink-0"
            />
          )}
          <span className="text-primaryText text-sm font-medium">
            Juror Alerts
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${stepBadge.className}`}
          >
            {stepBadge.label}
          </span>
        </div>
      </div>
      {!isVerified ? (
        <div className="border-stroke mb-4 rounded-2xl border p-3 text-left">
          <div className="mb-3 flex items-start gap-2">
            <WarningCircle16Icon
              width={16}
              height={16}
              className="fill-purple mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 className="text-primaryText text-xs font-semibold">
                Sign in to manage juror alerts
              </h4>
              <p className="text-secondaryText mt-0.5 text-xs leading-relaxed">
                Sign in with your wallet to check your alert status or enable
                notifications.
              </p>
            </div>
          </div>
          <SignInButton className="w-full py-2 text-sm" />
        </div>
      ) : isFetchingUser ? (
        <div className="border-stroke mb-4 flex items-center justify-center rounded-2xl border p-3">
          <div className="border-purple h-5 w-5 animate-spin rounded-full border-b-2" />
        </div>
      ) : showForm ? (
        <div className="border-stroke mb-4 rounded-2xl border p-3 text-left">
          <div className="mb-2 flex items-start gap-2">
            <WarningCircle16Icon
              width={16}
              height={16}
              className="fill-orange flex-shrink-0"
            />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                {isEditing ? "Change email" : "Juror alerts not enabled"}
              </h4>
              <p className="text-secondaryText mt-0.5 text-xs leading-relaxed">
                {isEditing ? (
                  "Enter a new email address for juror alerts."
                ) : (
                  <>
                    Consider enabling alerts to avoid missing draws and{" "}
                    <ExternalLink
                      href="https://docs.kleros.io/products/court/kleros-juror-tutorial#staking-and-cases"
                      className="text-purple hover:underline"
                    >
                      losing your stake.
                    </ExternalLink>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Field
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isBusy}
              placeholder="Enter your email"
              className={!isEmailValid ? "!border-red-500" : ""}
            />
            <AuthGuard
              signInButtonProps={{
                className: "px-5 py-2.5 text-sm whitespace-nowrap",
              }}
            >
              <ActionButton
                onClick={handleSubmitEmail}
                label={isEditing ? "Save" : "Enable"}
                disabled={
                  !trimmedEmail ||
                  !isEmailValid ||
                  isBusy ||
                  (isEditing && !canUpdateEmail)
                }
                isLoading={isBusy}
                variant="primary"
                className="whitespace-nowrap px-5 py-2.5 text-sm"
              />
            </AuthGuard>
          </div>

          {!isEmailValid && (
            <p className="mt-1 text-[11px] text-red-500">
              Please enter a valid email
            </p>
          )}
          {isEditing && !canUpdateEmail && (
            <CooldownNote minutes={minutesUntilUpdateable} />
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEditing}
              className="text-secondaryText hover:text-primaryText mt-2 text-xs transition"
            >
              Cancel
            </button>
          )}
        </div>
      ) : alertsPending ? (
        <div className="bg-lightOrange border-orange mb-4 rounded-2xl border p-3 text-left">
          <div className="flex items-start gap-2">
            <WarningCircle16Icon
              width={22}
              height={22}
              className="fill-orange flex-shrink-0"
            />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                Verification pending
              </h4>
              <p className="text-secondaryText mt-0.5 text-xs">
                We sent a verification email to{" "}
                <span className="text-primaryText font-medium">
                  {user?.email}
                </span>
                . Check your inbox and spam folder.
              </p>
              {!canUpdateEmail && (
                <CooldownNote minutes={minutesUntilUpdateable} />
              )}
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isBusy || !canUpdateEmail}
                  className="text-purple text-xs font-medium hover:underline disabled:opacity-50"
                >
                  Resend verification
                </button>
                <button
                  type="button"
                  onClick={handleStartEditing}
                  disabled={isBusy || !canUpdateEmail}
                  className="text-orange text-xs font-medium hover:underline disabled:opacity-50"
                >
                  Change email
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="box-success mb-4 rounded-2xl p-3 text-left">
          <div className="flex items-start gap-2">
            <CheckCircleIcon
              width={22}
              height={22}
              className="text-status-registered flex-shrink-0"
            />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                Juror alerts enabled
              </h4>
              <p className="text-secondaryText mt-0.5 text-xs">
                We&apos;ll notify you when you&apos;re drawn.
              </p>
              <button
                type="button"
                onClick={handleStartEditing}
                disabled={isBusy || !canUpdateEmail}
                className="text-orange mt-1 text-xs font-medium hover:underline disabled:opacity-50"
              >
                Change email
              </button>
              {!canUpdateEmail && (
                <CooldownNote
                  minutes={minutesUntilUpdateable}
                  className="mt-0.5"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-center">
        <ActionButton
          onClick={() => router.push("/app")}
          label="Claim More Rewards"
          className="w-full py-3"
          variant="primary"
        />
      </div>

      <ExternalLink
        href="https://kleros.notion.site/poh-airdrop-faqs"
        className="text-purple mt-3 flex items-center justify-center gap-1 text-sm transition hover:opacity-80"
      >
        <span>Trouble claiming?</span>
        <span className="flex items-center gap-1">
          See FAQs
          <NewTabIcon width={12} height={12} />
        </span>
      </ExternalLink>
      <JurorAlertsModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

function CooldownNote({
  minutes,
  className = "mt-1",
}: {
  minutes: number;
  className?: string;
}) {
  return (
    <p className={`text-secondaryText ${className} text-[11px] italic`}>
      You can update again in {minutes} {minutes === 1 ? "minute" : "minutes"}.
    </p>
  );
}
