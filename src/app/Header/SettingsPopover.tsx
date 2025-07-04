import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Popover from "components/Popover";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
// import InfoIcon from "icons/info.svg";
// import { formatRelativeTime } from "utils/time";
import { useSettingsPopover } from "context/SettingsPopoverContext";
import { useDisconnect } from "wagmi";

// Basic email validation regex
// const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// enum EditMode {
//   VIEW = 'view',
//   EDIT = 'edit'
// }

const SettingsPopover: React.FC = () => {
  // const [email, setEmail] = useState<string>("");
  // const [editMode, setEditMode] = useState<EditMode>(EditMode.VIEW);
  // const [transientStatus, setTransientStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const { isOpen, closeSettingsPopover, toggleSettingsPopover } = useSettingsPopover();
  const { disconnect } = useDisconnect();

  const {
    // isUpdatingUser,
    // isAddingUser,
    // user,
    // addUser,
    // updateEmail: updateUserEmail,
  } = useAtlasProvider();

  // useEffect(() => {
  //   if (user) {
  //     if (user.email) {
  //       setEmail(user.email);
  //       setEditMode(EditMode.VIEW);
  //     } else {
  //       setEditMode(EditMode.EDIT);
  //       setEmail("");
  //     }
  //   } else {
  //     setEditMode(EditMode.VIEW);
  //   }
  // }, [user]);

  // const validFutureUpdateDate = useMemo(() => {
  //   if (user?.email && user.emailUpdateableAt) {
  //     const updateableAt = new Date(user.emailUpdateableAt);
  //     if (!isNaN(updateableAt.getTime()) && updateableAt > new Date()) {
  //       return updateableAt;
  //     }
  //   }
  //   return null;
  // }, [user?.email, user?.emailUpdateableAt]);


  // const handleCancelEdit = () => {
  //   setEmail(user?.email || "");
  //   setEditMode(EditMode.VIEW);
  //   closeSettingsPopover();
  // };

  // const handleSaveEmail = async () => {
  //   const trimmedEmail = email.trim();

  //   const handleSuccess = (message: string) => {
  //     toast.success(message);
  //     setEditMode(EditMode.VIEW);
  //     closeSettingsPopover();
  //   };

  //   try {
  //     let success;
  //     if (user?.email) {
  //       success = await updateUserEmail({ newEmail: trimmedEmail });
  //       if (success) {
  //         handleSuccess("Email updated successfully. Please check your inbox for verification.");
  //       } else {
  //         toast.error("Failed to update email");
  //       }
  //     } else {
  //       success = await addUser({ email: trimmedEmail });
  //       if (success) {
  //         handleSuccess("Email saved successfully. Please check your inbox for verification.");
  //       } else {
  //         toast.error("Failed to save email");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error processing email:", error);
  //     const errorMessage = user?.email ? "Failed to update email" : "Failed to save email";
  //     setTransientStatus({ message: errorMessage, type: 'error' });
  //     toast.error(errorMessage);
  //   }
  // };

  const handleDisconnect = () => {
    disconnect();
    closeSettingsPopover();
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (editMode === EditMode.EDIT) {
  //     if (e.key === 'Enter') {
  //       e.preventDefault();
  //       handleSaveEmail();
  //     } else if (e.key === 'Escape') {
  //       e.preventDefault();
  //       handleCancelEdit();
  //     }
  //   }
  // };

  // const getActionButtonProps = (): { label: string; isDisabled: boolean } => {
  //   if (editMode === EditMode.EDIT) {
  //     const label = isAddingUser || isUpdatingUser ? "" : user?.email ? "Update" : "Save";
  //     const isDisabled =
  //       !email.trim() ||
  //       !isEmailValid ||
  //       isUpdatingUser || 
  //       isAddingUser ||
  //       user?.email === email;
  //     return { label, isDisabled };
  //   } else {
  //     const label = "Edit";
  //     const isDisabled = !!validFutureUpdateDate;
  //     return { label, isDisabled };
  //   }
  // };

  const onPopoverClose = () => {
    closeSettingsPopover();
    // if (editMode === EditMode.EDIT) {
    //   handleCancelEdit();
    // }
    // setTransientStatus(null);
  };

  // const handleResendVerification = async () => {
  //   if (!user?.email) return;
    
  //   try {
  //     const success = await updateUserEmail({ newEmail: user.email });
  //     if (success) {
  //       toast.success("Verification email sent successfully. Please check your inbox.");
  //       setTransientStatus({ message: "Verification email sent", type: 'success' });
  //     } else {
  //       toast.error("Failed to resend verification email");
  //       setTransientStatus({ message: "Failed to resend verification email", type: 'error' });
  //     }
  //   } catch (error) {
  //     console.error("Error resending verification email:", error);
  //     toast.error("Failed to resend verification email");
  //     setTransientStatus({ message: "Failed to resend verification email", type: 'error' });
  //   }
  // };

  // let editButtonTooltip = undefined;
  // if (validFutureUpdateDate) {
  //   editButtonTooltip = `You can update email ${formatRelativeTime(validFutureUpdateDate)}`;
  // }

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[26rem] sm:relative sm:left-auto sm:top-auto sm:transform-none sm:w-[26rem] sm:max-w-none"
      >
        <div className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-primaryText">Settings</h2>
          </div>
          <div className="mb-6 flex justify-center w-full">
            <AuthGuard>
              <ActionButton
                onClick={handleDisconnect}
                label="Disconnect"
                className="px-5 py-2"
                ariaLabel="Disconnect wallet"
              />
            </AuthGuard>
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
                              className={`text-primaryText w-full text-base
                                 rounded-sm border px-4 py-2 font-medium
                                  focus:outline-none focus:ring-0 rounded-r-none transition-colors duration-200 min-h-[44px] ${
                                !isEmailValid && email.trim() !== "" 
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-stroke focus:border-stroke"
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
            </div>
          )} */}
        </div>
      </Popover>
    </div>
  );
};

export default SettingsPopover;