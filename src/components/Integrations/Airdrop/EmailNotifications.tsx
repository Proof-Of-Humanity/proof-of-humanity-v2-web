"use client";
import React, { useState, useCallback } from "react";
import ActionButton from "components/ActionButton";
import LawBalance from "icons/LawBalance.svg";
import CheckCircle from "icons/CheckCircle.svg";
import Field from "components/Field";
import FeatureList from "components/FeatureList";
import { useAccount, useSignMessage } from "wagmi";
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from "react-toastify";
import { buildSubscribeSettings, updateNotificationSettings, SettingsUpdate } from "data/notifications";
import { getClaimerName } from "data/claimer";
import { isValidEmailAddress } from "utils/validators";
import { extractErrorMessage } from "utils/errors";

const EmailNotifications = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [userEmail, setUserEmail] = useState("");
  const {data : displayName , isLoading: isFetching } = useQuery({
    queryKey: ["displayName", address],
    queryFn: async () => {
      return await getClaimerName(address as `0x${string}`);
    },
    enabled: !!address,
  });

  const baseUrl = process.env.USER_SETTINGS_URL;

  const signSettings = useCallback(
    async (settings: object): Promise<string> => {
      const message = JSON.stringify(settings);
      const signature = await signMessageAsync({ message });
      return signature;
    },
    [address, signMessageAsync]
  );

  const trimmedEmail = userEmail.trim();
  const isEmailValid = trimmedEmail.length === 0 ? true : isValidEmailAddress(trimmedEmail);

  const {mutate: subscribe, isPending: isSubmitting, isSuccess, reset: resetSubscriptionState } = useMutation({
    mutationFn: async (args: { nextEmail: string; fullName?: string }) => {
      if (!baseUrl) throw new Error("Missing USER_SETTINGS_URL");
      if (!address) throw new Error("Wallet not connected");
      const settings: SettingsUpdate = buildSubscribeSettings(args.nextEmail, args.fullName);
      const signature = await signSettings(settings);
      await updateNotificationSettings({
        baseUrl,
        address,
        settings,
        signature,
      });
    },
    onSuccess: async () => {
      toast.success("Successfully subscribed to notifications!");
    },
    onError: (err) => {
      const message = extractErrorMessage(err).toLowerCase();
      if(message.includes("rejected") || message.includes("denied")) {
        toast.error("Request Rejected");
      } else {
        toast.error("Failed to subscribe to notifications");
      }
    },
  });
  
  const deriveNameFromEmail = useCallback((emailInput: string): string => {
    const localPart = emailInput.split("@")[0] || "";
    const cleaned = localPart.replace(/[^a-zA-Z0-9 _.-]/g, " ");
    return cleaned.replace(/\s+/g, " ").trim();
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!trimmedEmail) {
      toast.info("Please enter a valid email");
      return;
    }
    const fallbackName = deriveNameFromEmail(trimmedEmail);
    subscribe({ nextEmail: trimmedEmail, fullName: displayName || fallbackName });
  }, [trimmedEmail, subscribe, displayName, deriveNameFromEmail]);


  return (
    <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#BE75FF] to-[#F9BFCE]">
      <div className="rounded-[29px] bg-primaryBackground p-2 lg:p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <LawBalance />
          <span className="text-purple text-sm font-medium">
            Congratulations! Now, you are staked on Humanity court!
          </span>
        </div>

        {/* Title */}
        <h2 className="text-primaryText text-2xl font-semibold mb-4">
        Subscribe to Get Notified About Earning Opportunities
        </h2>

        {/* Description */}
        <p className="text-primaryText text-sm mb-4 leading-relaxed">
        Get real-time alerts when new juror opportunities go live.
        </p>
        
        <p className="text-secondaryText text-sm mb-6 leading-relaxed">
          Why Subscribe? Because missing a juror draw means missing rewards, reputation, and your chance to help shape decentralized justice.
        </p>

        {/* Benefits */}
        <div className="mb-6">
          <FeatureList
            items={[
              {
                text: "Never miss a chance to earn. We’ll notify you as soon as you’re drawn. Your email will only be used for important updates.",
                iconType: 'check'
              },
              {
                text: "Voting coherently + voting on time = getting paid",
                iconType: 'check'
              }
            ]}
            spacing="normal"
            iconWidth={16}
            iconHeight={16}
            iconClassName="fill-purple flex-shrink-0"
          />
        </div>

        {/* Email Section */}
        <div className="space-y-4 px-4 py-2 lg:px-0 lg:py-0">
          <div>
            <label htmlFor="email" className="block text-orange text-sm font-medium mb-2 uppercase">
              EMAIL
            </label>
              <div className="flex flex-col sm:flex-row">
                <Field
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => {
                    if (isSuccess) resetSubscriptionState();
                    setUserEmail(e.target.value);
                  }}
                  disabled={isFetching}
                  placeholder="myemail@email.com"
                  className={`flex-1 px-4 py-3 border-2 rounded-lg text-primaryText placeholder-secondaryText focus:outline-none ${isEmailValid ? "border-orange focus:border-purple" : "border-red-500 focus:border-red-500"}`}
                />
                <ActionButton
                  onClick={handleSubscribe}
                  label="Subscribe"
                  disabled={!address || !trimmedEmail || !isEmailValid || isFetching}
                  isLoading={isSubmitting}
                  className="px-8 lg:mb-0 mb-2"
                  variant="primary"
                />
              </div>
            {!isEmailValid && (
              <p className="mt-2 text-xs text-red-500">Please enter a valid email</p>
            )}
            {isSuccess && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 fill-green-500" />
                <p className="text-xs text-green-500">Successfully subscribed to notifications!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;
