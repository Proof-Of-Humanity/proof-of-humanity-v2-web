"use client";
import React from 'react';
import Image from "next/image";
import CheckCircleIcon from "icons/CheckCircle.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import ActionButton from "components/ActionButton";
import CrossCircle16Icon from "icons/CrossCircle16.svg";

export type SeerEligibilityStatus = "eligible" | "not-eligible" | "disconnected";

interface SeerStatusCardProps {
  status: SeerEligibilityStatus;
  onActionClick: () => void;
  isLoading?: boolean;
}

export default function SeerStatusCard({ status, onActionClick, isLoading = false }: SeerStatusCardProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case "eligible":
        return {
          icon: <CheckCircleIcon width={16} height={16} className="fill-green-500 mr-1" />,
          label: "Eligible",
          text: "Claim your credits now and place your first prediction on the Seer market.",
          textColor: "text-green-500",
          buttonLabel: "Claim $10",
        };
      case "not-eligible":
        return {
          icon: <CrossCircle16Icon width={16} height={16} className="fill-status-removed" />,
          label: "Not eligible:",
          text: "You need to be a verified human",
          textColor: "text-red-500",
          buttonLabel: "Register Now",
        };
      case "disconnected":
      default:
        return {
          icon: <WarningCircle16Icon width={16} height={16} className="fill-orange" />,
          label: "Disconnected",
          text: "Connect to check your eligibility",
          textColor: "text-orange",
          buttonLabel: "Connect wallet",
        };
    }
  };

  const { icon, label, text, textColor, buttonLabel } = getStatusDisplay();

  // Show loading state
  if (isLoading) {
    return (
      <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-t-[1px] border-t-[#BE75FF] lg:border-t-0 lg:border-l-[1px] lg:border-l-[#BE75FF]">
        <div className="text-center">
          <p className="text-purple text-sm font-medium mb-6">Reward</p>
          <h3 className="text-primaryText text-xl font-semibold mb-6">Unlock Your $10 Seer Balance</h3>
          <div className="flex items-center justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple"></div>
          </div>
          <div className="text-secondaryText text-sm">
            Checking eligibility...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-t-[1px] border-t-[#BE75FF] lg:border-t-0 lg:border-l-[1px] lg:border-l-[#BE75FF]">
      <div className="text-center">
        <p className="text-purple text-sm font-medium mb-1">Reward</p>
        <h3 className="text-primaryText text-xl font-semibold">Unlock Your $10 Seer Balance</h3>
      </div>

      {status != "disconnected" ? <div className="flex items-center justify-center m-2">
        <Image
          src="/logo/seers-credit-logo.svg"
          alt="Seer Credits"
          width={64}
          height={64}
        />
      </div>: <div className='h-[48px]'></div>}

      <div className="text-center">
        <div className="mb-2">
          <div className="flex items-center justify-center mb-1">
            {icon}
            <span className={`${textColor} text-sm font-medium ml-1`}>{label}</span>
          </div>
          {status === "eligible" ? (
            <span className={`${textColor} text-sm font-medium`}>{text}</span>
          ) : (
            <p className={`${textColor} text-sm`}>{text}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center w-full">
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

