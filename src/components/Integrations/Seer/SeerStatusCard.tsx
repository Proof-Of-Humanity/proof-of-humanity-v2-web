"use client";
import React from "react";
import Image from "next/image";
import CheckCircleIcon from "icons/CheckCircle.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import ActionButton from "components/ActionButton";
import CrossCircle16Icon from "icons/CrossCircle16.svg";

export type SeerEligibilityStatus =
  | "eligible"
  | "not-eligible"
  | "disconnected";

interface SeerStatusCardProps {
  status: SeerEligibilityStatus;
  onActionClick: () => void;
  isLoading?: boolean;
  address?: string;
}

export default function SeerStatusCard({
  status,
  onActionClick,
  isLoading = false,
  address,
}: SeerStatusCardProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case "eligible":
        return {
          icon: (
            <CheckCircleIcon
              width={16}
              height={16}
              className="mr-1 fill-green-500"
            />
          ),
          label: "Eligible",
          text: "Use $10 of Seer Credits now",
          textColor: "text-green-500",
          buttonLabel: "Start Trading",
        };
      case "not-eligible":
        return {
          icon: (
            <CrossCircle16Icon
              width={16}
              height={16}
              className="fill-status-removed"
            />
          ),
          label: "Not eligible:",
          text: "Register to unlock $10 of Seer Credits",
          textColor: "text-red-500",
          buttonLabel: "Register Now",
        };
      case "disconnected":
      default:
        return {
          icon: (
            <WarningCircle16Icon
              width={16}
              height={16}
              className="fill-orange"
            />
          ),
          label: "Disconnected",
          text: "Connect to check your eligibility",
          textColor: "text-orange",
          buttonLabel: "Connect wallet",
        };
    }
  };

  const { icon, label, text, textColor, buttonLabel } = getStatusDisplay();

  const trackedAddressRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!address || status !== "eligible") return;

    const normalizedAddress = address.toLowerCase();
    if (trackedAddressRef.current === normalizedAddress) return;

    trackedAddressRef.current = normalizedAddress;

    void fetch("/.netlify/functions/seer-claim-render-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: normalizedAddress }),
      keepalive: true,
    }).catch(() => undefined);
  }, [address, status]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-whiteBackground rounded-[30px] border-t-[1px] border-t-[#BE75FF] p-6 lg:w-[391px] lg:border-l-[1px] lg:border-t-0 lg:border-l-[#BE75FF] lg:p-8">
        <div className="text-center">
          <p className="text-purple mb-6 text-sm font-medium">Reward</p>
          <h3 className="text-primaryText mb-6 text-xl font-semibold">
            Unlock Your $10 Seer Balance
          </h3>
          <div className="my-8 flex items-center justify-center">
            <div className="border-purple h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
          <div className="text-secondaryText text-sm">
            Checking eligibility...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-whiteBackground rounded-[30px] border-t-[1px] border-t-[#BE75FF] p-6 lg:w-[391px] lg:border-l-[1px] lg:border-t-0 lg:border-l-[#BE75FF] lg:p-8">
      <div className="text-center">
        <p className="text-purple mb-1 text-sm font-medium">Reward</p>
        <h3 className="text-primaryText text-xl font-semibold">Seer Credits</h3>
      </div>

      {status !== "disconnected" ? (
        <div className="m-2 flex items-center justify-center">
          <Image
            src="/logo/seers-credit-logo.svg"
            alt="Seer Credits"
            width={64}
            height={64}
          />
        </div>
      ) : (
        <div className="h-[48px]"></div>
      )}

      <div className="text-center">
        <div className="mb-2">
          <div className="mb-1 flex items-center justify-center">
            {icon}
            <span className={`${textColor} ml-1 text-sm font-medium`}>
              {label}
            </span>
          </div>
          {status === "eligible" ? (
            <span className={`${textColor} text-sm font-medium`}>{text}</span>
          ) : (
            <p className={`${textColor} text-sm`}>{text}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex w-full justify-center">
        <ActionButton
          onClick={onActionClick}
          label={buttonLabel}
          isLoading={isLoading}
          className="w-44 py-3"
        />
      </div>
    </div>
  );
}
