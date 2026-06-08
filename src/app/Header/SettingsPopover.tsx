import React from "react";
import Image from "next/image";
import Popover from "components/Popover";
import ActionButton from "components/ActionButton";
import SignInButton from "components/SignInButton";
import EmailField from "./EmailField";
import EmailVerificationNotice from "./EmailVerificationNotice";
import UnsubscribeModal from "./UnsubscribeModal";
import { useEmailSettings } from "./useEmailSettings";

const SettingsPopover: React.FC = () => {
  const {
    isOpen,
    toggleSettingsPopover,
    closeAndDiscardChanges,
    isVerified,
    email,
    setEmail,
    showEmailError,
    hasSavedEmail,
    hasVerifiedEmail,
    handleKeyDown,
    showVerificationNotice,
    canResend,
    isBusy,
    isResending,
    minutesUntilUpdateable,
    resendVerification,
    isSavingEmail,
    isSaveDisabled,
    cooldownTooltip,
    saveEmail,
    isUnsubscribeModalOpen,
    openUnsubscribeModal,
    closeUnsubscribeModal,
    confirmUnsubscribe,
    isDeleting,
  } = useEmailSettings();

  return (
    <div>
      <Popover
        trigger={
          <span onClick={toggleSettingsPopover} className="cursor-pointer">
            <Image
              alt="notifications"
              className="mx-2"
              src="/logo/notifications.svg"
              height={20}
              width={20}
            />
          </span>
        }
        open={isOpen}
        onClose={closeAndDiscardChanges}
        className="fixed left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[22rem] -translate-x-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:top-auto sm:w-[22rem] sm:max-w-none sm:transform-none"
      >
        <div className="p-4">
          <div className="mb-4 text-center">
            <h2 className="text-primaryText text-xl font-semibold">
              Notifications
            </h2>
          </div>

          {!isVerified ? (
            <SignInButton className="min-h-[44px] w-full px-6 text-base normal-case transition-colors duration-200 md:w-full" />
          ) : (
            <div className="space-y-3 text-center">
              <div className="flex flex-col items-center">
                <EmailField
                  value={email}
                  isInvalid={showEmailError}
                  autoFocus={!hasSavedEmail}
                  onChange={setEmail}
                  onKeyDown={handleKeyDown}
                />

                {showVerificationNotice && (
                  <EmailVerificationNotice
                    canResend={canResend}
                    disabled={isBusy}
                    isResending={isResending}
                    minutesUntilUpdateable={minutesUntilUpdateable}
                    onResend={resendVerification}
                  />
                )}
              </div>

              <ActionButton
                onClick={saveEmail}
                isLoading={isSavingEmail}
                disabled={isSaveDisabled}
                label="Save"
                fullWidth
                className="min-h-[44px] w-full px-6 text-base normal-case transition-colors duration-200 md:w-full"
                ariaLabel={cooldownTooltip || "Save email address"}
                tooltip={cooldownTooltip}
              />

              {hasVerifiedEmail && (
                <ActionButton
                  onClick={openUnsubscribeModal}
                  label="Unsubscribe"
                  disabled={isBusy}
                  variant="secondary"
                  className="min-h-[44px] w-full px-6 text-base normal-case transition-colors duration-200 md:w-full"
                  ariaLabel="Unsubscribe from Kleros notifications"
                />
              )}
            </div>
          )}
        </div>
      </Popover>

      <UnsubscribeModal
        open={isUnsubscribeModalOpen}
        isDeleting={isDeleting}
        onClose={closeUnsubscribeModal}
        onConfirm={confirmUnsubscribe}
      />
    </div>
  );
};

export default SettingsPopover;
