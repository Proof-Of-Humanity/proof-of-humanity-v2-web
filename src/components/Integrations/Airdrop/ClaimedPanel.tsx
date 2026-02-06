"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAtlasProvider } from "@kleros/kleros-app";

import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import SignInButton from "components/SignInButton";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import PnkDisplay from "components/Integrations/Airdrop/PnkDisplay";
import JurorAlertsModal from "components/Integrations/Airdrop/JurorAlertsModal";

import CheckCircleMinorIcon from "icons/CheckCircleMinor.svg";
import CheckCircleIcon from "icons/CheckCircle.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import NewTabIcon from "icons/NewTab.svg";

import { isValidEmailAddress } from "utils/validators";
import { extractErrorMessage } from "utils/errors";

interface ClaimedPanelProps {
  amountPerClaim: bigint;
  isTestnet: boolean;
}

export default function ClaimedPanel({ amountPerClaim, isTestnet }: ClaimedPanelProps) {
  const router = useRouter();
  const { address } = useAccount();
  const {
    isVerified,
    addUser,
    updateEmail,
    user,
    isFetchingUser,
    isAddingUser,
    isUpdatingUser,
  } = useAtlasProvider();

  const [userEmail, setUserEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const trimmedEmail = userEmail.trim();
  const isEmailValid = trimmedEmail.length === 0 ? true : isValidEmailAddress(trimmedEmail);

  // Derived email state
  const hasEmail = !!user?.email;
  const isEmailVerified = user?.isEmailVerified ?? false;
  const emailUpdateableAt = user?.emailUpdateableAt ? new Date(user.emailUpdateableAt) : null;
  const canUpdateEmail = !emailUpdateableAt || new Date() >= emailUpdateableAt;
  const minutesUntilUpdateable = emailUpdateableAt && !canUpdateEmail
    ? Math.max(1, Math.round((emailUpdateableAt.getTime() - Date.now()) / 60000))
    : 0;

  // Stepper status
  const alertsEnabled = hasEmail && isEmailVerified;
  const alertsPending = hasEmail && !isEmailVerified;
  const showForm = !hasEmail || isEditing;

  // Auto-show modal when mounted if user is signed in and hasn't set an email
  useEffect(() => {
    if (isVerified && !isFetchingUser && !hasEmail) {
      setShowModal(true);
    }
  }, [isVerified, isFetchingUser, hasEmail]);

  // Reset local email UI state on wallet switch (not on initial mount).
  const prevAddress = React.useRef(address);
  useEffect(() => {
    if (prevAddress.current !== undefined && prevAddress.current !== address) {
      setShowModal(false);
      setIsEditing(false);
      setUserEmail("");
    }
    prevAddress.current = address;
  }, [address]);

  const { mutate: submitEmail, isPending: isSubmitting } = useMutation({
    mutationFn: async (args: { nextEmail: string; isResend?: boolean }): Promise<boolean> => {
      if (!address) throw new Error("Wallet not connected");
      const trimmedEmail = args.nextEmail.trim();
      if (user?.email) {
        // Skip same-email check if this is a resend request
        if (!args.isResend && user.email.toLowerCase() === trimmedEmail.toLowerCase()) return false;
        const updated = await updateEmail({ newEmail: trimmedEmail });
        if (!updated) throw new Error("Failed to update email");
        return true;
      }
      try {
        const added = await addUser({ email: trimmedEmail });
        if (!added) throw new Error("Failed to save email");
      } catch {
        const updated = await updateEmail({ newEmail: trimmedEmail });
        if (!updated) throw new Error("Failed to update email");
      }
      return true;
    },
    onSuccess: (wasUpdated) => {
      if (wasUpdated) {
        toast.success("Email saved! Check your inbox to verify.");
      } else {
        toast.info("Email is already set to this address.");
      }
      setUserEmail("");
      setIsEditing(false);
    },
    onError: (err) => {
      const message = extractErrorMessage(err).toLowerCase();
      if (message.includes("rejected") || message.includes("denied")) {
        toast.error("Request Rejected");
      } else {
        toast.error("Failed to save email");
      }
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

  const isBusy = isSubmitting || isAddingUser || isUpdatingUser || isFetchingUser;

  const stepBadge = !isVerified
    ? { label: "Sign In", className: "bg-grey text-purple" }
    : alertsEnabled
      ? { label: "Enabled", className: "bg-green-50 text-green-600" }
      : alertsPending
        ? { label: "Unverified", className: "bg-lightOrange text-orange" }
        : { label: "Pending", className: "bg-lightOrange text-orange" };

  return (
    <>
      {/* ── Success Header ── */}
      <div className="mb-4 flex justify-center">
        <CheckCircleMinorIcon width={64} height={64} />
      </div>
      <div className="text-status-registered text-sm font-medium mb-1">Success!</div>
      <PnkDisplay amount={amountPerClaim} />
      <div className="text-secondaryText text-sm mb-2 -mt-5">
        Claimed &amp; Staked on Humanity court
      </div>
      {isTestnet && (
        <div className="text-secondaryText text-xs mb-4">
          On testnet, you will be staked in the General Court.
        </div>
      )}

      {/* ── Vertical Stepper ── */}
      <div className="border border-stroke rounded-lg p-3 mb-3 text-left">
        {/* Step 1 */}
        <div className="flex items-center gap-1">
          <CheckCircleIcon width={22} height={22} className="text-status-registered flex-shrink-0 mt-1" />
          <span className="text-primaryText text-sm font-medium">
            Claimed &amp; Staked
          </span>
        </div>

        <div className="flex items-center gap-1">
          {alertsEnabled ? (
            <CheckCircleIcon width={22} height={22} className="text-status-registered flex-shrink-0 mt-1" />
          ) : !isVerified ? (
            <WarningCircle16Icon width={22} height={22} className="fill-purple flex-shrink-0 mt-1" />
          ) : (
            <WarningCircle16Icon width={22} height={22} className="fill-orange flex-shrink-0 mt-1" />
          )}
          <span className="text-primaryText text-sm font-medium">Juror Alerts</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${stepBadge.className}`}
          >
            {stepBadge.label}
          </span>
        </div>
      </div>
      {!isVerified ? (
        /* State 0: Not signed in */
        <div className="border border-stroke rounded-lg p-3 mb-4 text-left">
          <div className="flex items-start gap-2 mb-3">
            <WarningCircle16Icon width={16} height={16} className="fill-purple flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-primaryText text-xs font-semibold">
                Sign in to manage juror alerts
              </h4>
              <p className="text-secondaryText text-xs mt-0.5 leading-relaxed">
                Sign in with your wallet to check your alert status or enable notifications.
              </p>
            </div>
          </div>
          <SignInButton className="w-full py-2 text-sm" />
        </div>
      ) : isFetchingUser ? (
        /* State 1: Loading */
        <div className="border border-stroke rounded-lg p-3 mb-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple" />
        </div>
      ) : showForm ? (
        /* State 2 & 5: No email / Editing */
        <div className="border border-stroke rounded-lg p-3 mb-4 text-left">
          <div className="flex items-start gap-2 mb-2">
            <WarningCircle16Icon width={16} height={16} className="fill-orange flex-shrink-0" />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                {isEditing ? "Change email" : "Juror alerts not enabled"}
              </h4>
              <p className="text-secondaryText text-xs mt-0.5 leading-relaxed">
                {isEditing
                  ? "Enter a new email address for juror alerts."
                  : (
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
            <AuthGuard signInButtonProps={{ className: "px-4 py-1.5 text-sm whitespace-nowrap" }}>
              <ActionButton
                onClick={handleSubmitEmail}
                label={isEditing ? "Save" : "Enable"}
                disabled={!trimmedEmail || !isEmailValid || isBusy || (isEditing && !canUpdateEmail)}
                isLoading={isBusy}
                variant="primary"
                className="px-4 py-1.5 text-sm whitespace-nowrap"
              />
            </AuthGuard>
          </div>

          {!isEmailValid && (
            <p className="mt-1 text-[11px] text-red-500">Please enter a valid email</p>
          )}
          {isEditing && !canUpdateEmail && (
            <p className="mt-1 text-[11px] text-secondaryText italic">
              You can update again in {minutesUntilUpdateable} {minutesUntilUpdateable === 1 ? "minute" : "minutes"}.
            </p>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEditing}
              className="mt-2 text-secondaryText text-xs hover:text-primaryText transition"
            >
              Cancel
            </button>
          )}
        </div>
      ) : alertsPending ? (
        /* State 3: Email set but unverified */
        <div className="bg-lightOrange border border-orange rounded-lg p-3 mb-4 text-left">
          <div className="flex items-start gap-2">
            <WarningCircle16Icon width={22} height={22} className="fill-orange flex-shrink-0" />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                Verification pending
              </h4>
              <p className="text-secondaryText text-xs mt-0.5">
                We sent a verification email to{" "}
                <span className="text-primaryText font-medium">{user?.email}</span>.
                Check your inbox and spam folder.
              </p>
              {!canUpdateEmail && (
                <p className="text-secondaryText text-[11px] mt-1 italic">
                  You can update again in {minutesUntilUpdateable} {minutesUntilUpdateable === 1 ? "minute" : "minutes"}.
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
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
        /* State 4: Email verified */
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-left">
          <div className="flex items-start gap-2">
            <CheckCircleIcon width={22} height={22} className="text-status-registered flex-shrink-0" />
            <div>
              <h4 className="text-primaryText text-sm font-semibold">
                Juror alerts enabled
              </h4>
              <p className="text-secondaryText text-xs mt-0.5">
                We&apos;ll notify you when you&apos;re drawn.
              </p>
              <button
                type="button"
                onClick={handleStartEditing}
                disabled={isBusy || !canUpdateEmail}
                className="mt-1 text-orange text-xs font-medium hover:underline disabled:opacity-50"
              >
                Change email
              </button>
              {!canUpdateEmail && (
                <p className="text-secondaryText text-[11px] mt-0.5 italic">
                  Updateable in {minutesUntilUpdateable} {minutesUntilUpdateable === 1 ? "minute" : "minutes"}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
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
        className="mt-3 flex items-center justify-center gap-1 text-sm text-purple hover:text-[#7c5cdb] transition"
      >
        <span>Trouble claiming?</span>
        <span className="flex items-center gap-1">
          See FAQs
          <NewTabIcon width={12} height={12} />
        </span>
      </ExternalLink>
      {console.log('[ClaimedPanel] Rendering JurorAlertsModal with open:', showModal)}
      <JurorAlertsModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
