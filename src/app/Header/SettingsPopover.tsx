import React, { useState, useEffect } from "react";
import Image from "next/image";
import Popover from "components/Popover";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";

const SettingsPopover: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  const {
    isVerified,
    isSigningIn,
    isUpdatingUser,
    user,
    userExists,
    addUser,
    authoriseUser,
    updateEmail: updateUserEmail,
  } = useAtlasProvider();

  // Update email state when user data changes
  useEffect(() => {
    console.log("user", user);
    console.log("isVerified", isVerified);
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const success = await updateUserEmail({ newEmail: email.trim() });
      if (success) {
        toast.success("Email updated successfully");
      } else {
        toast.error("Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    }
  };

  const handleSignIn = async () => {
    try {
      await authoriseUser();
      await addUser();
      toast.success("Successfully signed in with SIWE");
    } catch (error) {
      console.error("SIWE sign in error:", error);
      toast.error("Failed to sign in");
    }
  };

  const getEmailButtonText = () => {
    if (user?.email) {
      return "Update";
    }
    return "Save";
  };

  const getEmailLabelText = () => {
    if (user?.email) {
      return "Update your email address";
    }
    return "Add your email address";
  };

  return (
    <div className="mt-[16px] flex flex-row md:mt-0">
      <Popover
        trigger={
          <Image
            alt="settings"
            className="mx-2 cursor-pointer"
            src="/logo/settings.svg"
            height={16}
            width={16}
          />
        }
        className="w-96"
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-primaryText">Settings</h2>
          </div>

          {/* Sign In Button - Show when not verified */}
          {!isVerified && (
            <div className="mb-6 flex justify-center w-full">
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="btn-main w-2/6 normal-case"
              >
                {isSigningIn ? "Signing In..." : "Sign In"}
              </button>
            </div>
          )}

          {/* Email Section - Only show when user is verified */}
          {isVerified && (
            <div className="space-y-4">
              <div>
                <span className="block text-sm ml-1 text-primaryText mb-2">
                  {getEmailLabelText()}
                </span>
                <div className="flex">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="bg-whiteBackgroundWithOpacity text-primaryText
                       w-full rounded-sm border border-stroke
                        px-4 py-2 font-medium focus:outline-none 
                        focus:ring-0 focus:border-stroke rounded-r-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveEmail}
                    disabled={isUpdatingUser || !email.trim()}
                    className="btn-main px-6 normal-case z-0"
                  >
                    {isUpdatingUser ? "Saving..." : getEmailButtonText()}
                  </button>
                </div>
                {user?.email && !user?.isEmailVerified && (
                  <p className="text-sm text-orange-500 mt-2">
                    Email verification pending. Check your inbox.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default SettingsPopover; 