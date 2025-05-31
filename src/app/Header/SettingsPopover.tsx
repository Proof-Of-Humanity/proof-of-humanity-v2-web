import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Popover from "components/Popover";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import ActionButton from "components/ActionButton";
import InfoIcon from "icons/info.svg";
import { formatRelativeTime } from "utils/time";

// Basic email validation regex
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

enum EditMode {
  VIEW = 'view',
  EDIT = 'edit'
}


const SettingsPopover: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [editMode, setEditMode] = useState<EditMode>(EditMode.VIEW);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [transientStatus, setTransientStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);

  const {
    isVerified,
    isSigningIn,
    isUpdatingUser,
    isAddingUser,
    user,
    addUser,
    authoriseUser,
    updateEmail: updateUserEmail,
  } = useAtlasProvider();

  useEffect(() => {
    console.log("user", user);
    if (user) {
      if (user.email) {
        setEmail(user.email);
        setEditMode(EditMode.VIEW);
      } else {
        setEditMode(EditMode.EDIT);
        setEmail("");
      }
    } else {
      setEditMode(EditMode.VIEW);
      setEmail("");
    }
  }, [user]);

  const validFutureUpdateDate = useMemo(() => {
    if (user?.email && user.emailUpdateableAt) {
      const updateableAt = new Date(user.emailUpdateableAt);
      if (!isNaN(updateableAt.getTime()) && updateableAt > new Date()) {
        return updateableAt;
      }
    }
    return null;
  }, [user?.email, user?.emailUpdateableAt]);


  const handleCancelEdit = () => {
    setEmail(user?.email || "");
    setEditMode(EditMode.VIEW);
    setPopoverOpen(false);
  };

  const handleSaveEmail = async () => {
    const trimmedEmail = email.trim();

    const handleSuccess = (message: string) => {
      toast.success(message);
      setEditMode(EditMode.VIEW);
      setPopoverOpen(false);
    };

    try {
      let success;
      if (user?.email) {
        success = await updateUserEmail({ newEmail: trimmedEmail });
        if (success) {
          handleSuccess("Email updated successfully. Please check your inbox for verification.");
        } else {
          toast.error("Failed to update email");
        }
      } else {
        success = await addUser({ email: trimmedEmail });
        if (success) {
          handleSuccess("Email saved successfully. Please check your inbox for verification.");
        } else {
          toast.error("Failed to save email");
        }
      }
    } catch (error) {
      console.error("Error processing email:", error);
      const errorMessage = user?.email ? "Failed to update email" : "Failed to save email";
      setTransientStatus({ message: errorMessage, type: 'error' });
      toast.error(errorMessage);
    }
  };

  const handleSignIn = async () => {
    try {
      await authoriseUser();
      toast.success("Successfully Signed In");
    } catch (error) {
      toast.error("Failed to sign in");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editMode === EditMode.EDIT) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveEmail();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    }
  };

  const getActionButtonProps = (): { label: string; isDisabled: boolean } => {
    if (editMode === EditMode.EDIT) {
      const label = isAddingUser || isUpdatingUser ? "" : user?.email ? "Update" : "Save";
      const isDisabled =
        !email.trim() ||
        !isEmailValid ||
        isUpdatingUser || isAddingUser;
      return { label, isDisabled };
    } else {
      const label = "Edit";
      const isDisabled = !!validFutureUpdateDate;
      return { label, isDisabled };
    }
  };

  const onPopoverClose = () => {
    setPopoverOpen(false);
    if (editMode === EditMode.EDIT) {
      handleCancelEdit();
    }
    setTransientStatus(null);
  };

  let editButtonTooltip = undefined;
  if (validFutureUpdateDate) {
    editButtonTooltip = `You can update email ${formatRelativeTime(validFutureUpdateDate)}`;
  }

  return (
    <div>
      <Popover
        trigger={
          <span onClick={() => setPopoverOpen(!popoverOpen)} className="cursor-pointer">
            <Image
              alt="settings"
              className="mx-2"
              src="/logo/settings.svg"
              height={16}
              width={16}
            />
          </span>
        }
        open={popoverOpen}
        onClose={onPopoverClose}
        className="w-[26rem]"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-primaryText">Settings</h2>
          </div>

          {!isVerified && (
            <div className="mb-6 flex justify-center w-full">
              <ActionButton
                onClick={handleSignIn}
                isLoading={isSigningIn}
                label={isSigningIn ? "Signing In..." : "Sign In"}
                className="normal-case min-h-[44px] transition-colors duration-200"
                ariaLabel="Sign in with wallet"
              />
            </div>
          )}

          {isVerified && (
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
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="px-4 py-2 text-primaryText">{user.email}</span>
                            </div>
                            <ActionButton
                              onClick={() => setEditMode(EditMode.EDIT)}
                              label={buttonState.label}
                              disabled={buttonState.isDisabled}
                              className={`px-6 normal-case text-base rounded-l-none min-h-[44px] transition-colors duration-200`}
                              ariaLabel={editButtonTooltip || `${buttonState.label} email address ${user.email}`}
                              tooltip={editButtonTooltip}
                            />
                          </div>
                        );
                      } else {
                        setEditMode(EditMode.EDIT); 
                        return null;
                      }
                    case EditMode.EDIT:
                      const buttonState = getActionButtonProps();
                      return (
                        <div className="flex">
                          <div className="flex-1">
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
                            isLoading={isUpdatingUser || isAddingUser}
                            disabled={buttonState.isDisabled}
                            label={buttonState.label}
                            className="px-6 normal-case text-base rounded-l-none min-h-[44px] transition-colors duration-200"
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
                    console.log("transientStatus", transientStatus);
                    let textColor = 'text-blue-600';
                    if (transientStatus.type === 'success') textColor = 'text-green-600';
                    if (transientStatus.type === 'error') textColor = 'text-red-600';
                    return (
                      <div className={`mt-3 text-sm ${textColor} animate-fadeIn`} role="alert">
                        <p>{transientStatus.message}</p>
                      </div>
                    );
                  } else if (user?.email && !user.isEmailVerified) {
                    return (
                      <div className="text-sm text-secondaryText animate-fadeIn flex gap-1" role="alert">
                        <InfoIcon className="h-8 w-8 stroke-orange-400 -mt-1" />
                        <span>Verification email sent! Please check your inbox to confirm your email address.</span>
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