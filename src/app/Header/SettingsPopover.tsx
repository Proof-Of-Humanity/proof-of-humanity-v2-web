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
  const showUnreadDot = isVerified && !hasVerifiedEmail;

  return (
    <div className="flex h-5 items-center">
      <Popover
        trigger={
          <span
            onClick={toggleSettingsPopover}
            className="relative mx-2 inline-flex h-5 w-5 cursor-pointer items-center justify-center"
          >
            <Image
              alt="notifications"
              src="/logo/notifications.svg"
              height={20}
              width={20}
            />
            {showUnreadDot && (
              <span
                aria-hidden="true"
                className="bg-status-removed absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white"
              />
            )}
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

          {/* EMAIL FUNCTIONALITY - COMMENTED OUT UNTIL BACKEND IS IMPLEMENTED */}
          {/* {isVerified && (
            <div>
              <span className="block text-sm ml-1 text-primaryText mb-3">
              Add/Update your email address
              </span>
              <div className="space-y-3">
                {(() => {
                  switch (editMode) {
                    case EditMode.VIEW:
                      if (user?.email) {
                        const buttonState = getActionButtonProps();
                        return (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div className="flex items-center flex-grow">
                              <span className="px-4 py-2 text-primaryText w-full sm:w-auto text-center sm:text-left break-all">{user.email}</span>
                            </div>
                            <ActionButton
                              onClick={() => setEditMode(EditMode.EDIT)}
                              label={buttonState.label}
                              disabled={buttonState.isDisabled}
                              className={`w-full sm:w-auto px-6 normal-case text-base min-h-[44px] transition-colors duration-200`}
                              ariaLabel={editButtonTooltip || `${buttonState.label} email address ${user.email}`}
                              tooltip={editButtonTooltip}
                            />
                          </div>
                        );
                      }
                    case EditMode.EDIT:
                      const buttonState = getActionButtonProps();
                      return (
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-1 mb-2 sm:mb-0 sm:mr-0">
                            <input
                              type="email"
                              value={email}
                              onKeyDown={handleKeyDown}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email"
                              autoFocus
                              className={`text-primaryText w-full bg-[#17141F] text-base
                                 rounded-input border px-4 py-2 font-medium
                                  focus:outline-none focus:ring-0 rounded-r-none transition duration-200 ease-premium min-h-[44px] ${
                                !isEmailValid && email.trim() !== ""
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-[rgba(255,255,255,0.08)] focus:border-orange"
                              }`}
                            />
                          </div>
                          <ActionButton
                            onClick={handleSaveEmail}
                            isLoading={(isUpdatingUser || isAddingUser)}
                            disabled={buttonState.isDisabled}
                            label={buttonState.label}
                            className="w-full sm:w-auto px-6 normal-case text-base rounded-l-none min-h-[44px] transition-colors duration-200"
                            ariaLabel={`${buttonState.label} email address`}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
                
                {(() => {
                  if (transientStatus) {
                    let textColor = 'text-blue-600';
                    if (transientStatus.type === 'success') textColor = 'text-green-600';
                    if (transientStatus.type === 'error') textColor = 'text-red-600';
                    return (
                      <div className={`mt-3 text-sm m-1 ${textColor} animate-fadeIn`} role="alert">
                        <p>{transientStatus.message}</p>
                      </div>
                    );
                  } else if (user?.email && !user.isEmailVerified) {
                    return (
                      <div className="text-sm text-secondaryText animate-fadeIn flex flex-col sm:flex-row gap-1 items-center sm:items-stretch text-center sm:text-left" role="alert">
                        <InfoIcon className="sm:h-4 h-8 sm:w-4 w-8 stroke-orange-400 shrink-0 mt-1" />
                        <span>We sent you a verification email. Please, verify it.
                        Didn't receive the email?{" "}
                          {!validFutureUpdateDate ? (
                            <button
                              onClick={handleResendVerification}
                              disabled={isUpdatingUser}
                              className="text-orange hover:text-orange-600 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {isUpdatingUser ? "Sending..." : "Resend"}
                            </button>
                          ) : (
                            <span className="text-secondaryText">
                              Please wait {formatRelativeTime(validFutureUpdateDate)} before resending
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
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
