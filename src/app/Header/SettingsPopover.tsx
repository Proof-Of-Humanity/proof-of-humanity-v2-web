import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAtlasProvider } from "@kleros/kleros-app";
import Popover from "components/Popover";
import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";
import InfoIcon from "icons/info.svg";
import { useSettingsPopover } from "context/SettingsPopoverContext";
import { useDisconnect } from "wagmi";
import { isValidEmailAddress } from "utils/validators";

enum EditMode {
  VIEW = "view",
  EDIT = "edit",
}

const SettingsPopover: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [editMode, setEditMode] = useState<EditMode>(EditMode.VIEW);

  const trimmedEmail = email.trim();
  const isEmailValid = useMemo(
    () => trimmedEmail.length === 0 || isValidEmailAddress(trimmedEmail),
    [trimmedEmail],
  );
  const { isOpen, closeSettingsPopover, toggleSettingsPopover } =
    useSettingsPopover();
  const { disconnect } = useDisconnect();

  const { isVerified, isUpdatingUser, isAddingUser, isFetchingUser, user } =
    useAtlasProvider();

  useEffect(() => {
    if (!user) {
      setEmail("");
      setEditMode(EditMode.VIEW);
      return;
    }

    if (user.email) {
      setEmail(user.email);
      setEditMode(EditMode.VIEW);
    } else {
      setEmail("");
      setEditMode(EditMode.EDIT);
    }
  }, [user]);

  const validFutureUpdateDate = useMemo(() => {
    if (!user?.email || !user.emailUpdateableAt) return null;

    const updateableAt = new Date(user.emailUpdateableAt);
    if (Number.isNaN(updateableAt.getTime()) || updateableAt <= new Date()) {
      return null;
    }

    return updateableAt;
  }, [user?.email, user?.emailUpdateableAt]);

  const minutesUntilUpdateable = validFutureUpdateDate
    ? Math.max(
        1,
        Math.round((validFutureUpdateDate.getTime() - Date.now()) / 60000),
      )
    : 0;

  const { mutate: submitEmail, isPending: isSubmitting } = useSubmitEmail({
    onSuccess: () => {
      setEditMode(EditMode.VIEW);
      closeSettingsPopover();
    },
  });

  const isBusy =
    isSubmitting || isUpdatingUser || isAddingUser || isFetchingUser;

  const handleCancelEdit = () => {
    setEmail(user?.email || "");
    setEditMode(user?.email ? EditMode.VIEW : EditMode.EDIT);
    closeSettingsPopover();
  };

  const handleSaveEmail = () => {
    if (!trimmedEmail || !isEmailValid) return;
    submitEmail({ nextEmail: trimmedEmail });
  };

  const handleDisconnect = () => {
    disconnect();
    closeSettingsPopover();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editMode !== EditMode.EDIT) return;

    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEmail();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const getActionButtonProps = (): { label: string; isDisabled: boolean } => {
    if (editMode === EditMode.EDIT) {
      return {
        label: user?.email ? "Update" : "Save",
        isDisabled:
          !trimmedEmail ||
          !isEmailValid ||
          isBusy ||
          user?.email === trimmedEmail ||
          !!validFutureUpdateDate,
      };
    }

    return {
      label: "Edit",
      isDisabled: isBusy || !!validFutureUpdateDate,
    };
  };

  const onPopoverClose = () => {
    closeSettingsPopover();
    if (editMode === EditMode.EDIT) {
      setEmail(user?.email || "");
      setEditMode(user?.email ? EditMode.VIEW : EditMode.EDIT);
    }
  };

  const handleResendVerification = () => {
    if (!user?.email) return;
    submitEmail({ nextEmail: user.email, isResend: true });
  };

  const editButtonTooltip = validFutureUpdateDate
    ? `You can update email in ${minutesUntilUpdateable} ${
        minutesUntilUpdateable === 1 ? "minute" : "minutes"
      }`
    : undefined;

  return (
    <div>
      <Popover
        trigger={
          <span onClick={toggleSettingsPopover} className="cursor-pointer">
            <Image
              alt="settings"
              className="mx-2"
              src="/logo/settings.svg"
              height={16}
              width={16}
            />
          </span>
        }
        open={isOpen}
        onClose={onPopoverClose}
        className="fixed left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:top-auto sm:w-[26rem] sm:max-w-none sm:transform-none"
      >
        <div className="p-4 sm:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-primaryText text-xl font-semibold">Settings</h2>
          </div>
          <div className="mb-6 flex w-full justify-center">
            <AuthGuard>
              <ActionButton
                onClick={handleDisconnect}
                label="Disconnect"
                className="px-5 py-2"
                ariaLabel="Disconnect wallet"
              />
            </AuthGuard>
          </div>

          {isVerified && (
            <div>
              <span className="text-primaryText mb-3 ml-1 block text-sm">
                Add/Update your email address
              </span>
              <div className="space-y-3">
                {(() => {
                  switch (editMode) {
                    case EditMode.VIEW:
                      if (user?.email) {
                        const buttonState = getActionButtonProps();
                        return (
                          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                            <div className="flex flex-grow items-center">
                              <span className="text-primaryText w-full break-all px-4 py-2 text-center sm:w-auto sm:text-left">
                                {user.email}
                              </span>
                            </div>
                            <ActionButton
                              onClick={() => setEditMode(EditMode.EDIT)}
                              label={buttonState.label}
                              disabled={buttonState.isDisabled}
                              className="min-h-[44px] w-full px-6 text-base normal-case transition-colors duration-200 sm:w-auto"
                              ariaLabel={
                                editButtonTooltip ||
                                `${buttonState.label} email address ${user.email}`
                              }
                              tooltip={editButtonTooltip}
                            />
                          </div>
                        );
                      }
                      return null;
                    case EditMode.EDIT: {
                      const buttonState = getActionButtonProps();
                      return (
                        <div className="flex flex-col sm:flex-row">
                          <div className="mb-2 flex-1 sm:mb-0 sm:mr-0">
                            <input
                              type="email"
                              value={email}
                              onKeyDown={handleKeyDown}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email"
                              autoFocus
                              className={`bg-whiteBackgroundWithOpacity text-primaryText placeholder:text-secondaryText min-h-[44px] w-full rounded-sm rounded-r-none border px-4 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-0 ${
                                !isEmailValid && trimmedEmail !== ""
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-stroke focus:border-stroke"
                              }`}
                            />
                          </div>
                          <ActionButton
                            onClick={handleSaveEmail}
                            isLoading={isBusy}
                            disabled={buttonState.isDisabled}
                            label={buttonState.label}
                            className="min-h-[44px] w-full rounded-l-none px-6 text-base normal-case transition-colors duration-200 sm:w-auto"
                            ariaLabel={`${buttonState.label} email address`}
                          />
                        </div>
                      );
                    }
                    default:
                      return null;
                  }
                })()}

                {!isEmailValid && trimmedEmail !== "" && (
                  <p className="ml-1 text-sm text-red-500">
                    Please enter a valid email
                  </p>
                )}
                {(() => {
                  if (user?.email && !user.isEmailVerified) {
                    return (
                      <div
                        className="text-secondaryText flex animate-fadeIn flex-col items-center gap-1 text-center text-sm sm:flex-row sm:items-stretch sm:text-left"
                        role="alert"
                      >
                        <InfoIcon className="mt-1 h-8 w-8 shrink-0 stroke-orange-400 sm:h-4 sm:w-4" />
                        <span>
                          We sent you a verification email. Please, verify it.
                          Didn&apos;t receive the email?{" "}
                          {!validFutureUpdateDate ? (
                            <button
                              onClick={handleResendVerification}
                              disabled={isBusy}
                              className="text-orange underline transition-colors duration-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy ? "Sending..." : "Resend"}
                            </button>
                          ) : (
                            <span className="text-secondaryText">
                              Please wait {minutesUntilUpdateable}{" "}
                              {minutesUntilUpdateable === 1
                                ? "minute"
                                : "minutes"}{" "}
                              before resending
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default SettingsPopover;
