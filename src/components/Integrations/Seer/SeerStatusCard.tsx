"use client";
import React from 'react';
import HourglassIcon from "icons/Hourglass.svg";
import CheckCircleIcon from "icons/CheckCircle.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import ActionButton from "components/ActionButton";

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
          icon: <CheckCircleIcon width={64} height={64} className="fill-green-500" />,
          text: "Eligible: Included profile",
          textColor: "text-green-500",
          buttonLabel: "Go to Seer",
        };
      case "not-eligible":
        return {
          icon: <HourglassIcon width={64} height={64} className="fill-orange" />,
          text: "You need to be an included profile",
          textColor: "text-orange",
          buttonLabel: "Register Now",
        };
      case "disconnected":
      default:
        return {
          icon: <WarningCircle16Icon width={64} height={64} className="fill-orange" />,
          text: "Connect to check your eligibility",
          textColor: "text-orange",
          buttonLabel: "Connect wallet",
        };
    }
  };

  const { icon, text, textColor, buttonLabel } = getStatusDisplay();

  return (
    <div className="flex flex-col items-center justify-center lg:w-[380px] p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-purple text-sm font-medium mb-1">Reward</p>
        <h3 className="text-primaryText text-xl font-semibold">Seer Credits</h3>
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center">
        {icon}
      </div>

      {/* Status Text */}
      <div className="text-center">
        {status === "not-eligible" && (
          <div className="flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" className="text-red-500" />
              <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="2" className="text-red-500" />
            </svg>
            <span className="text-red-500 text-sm font-medium">Not eligible:</span>
          </div>
        )}
        {status === "eligible" && (
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon width={16} height={16} className="fill-green-500 mr-1" />
            <span className="text-green-500 text-sm font-medium">Eligible:</span>
          </div>
        )}
        {status === "disconnected" && (
          <div className="flex items-center justify-center mb-2">
            <WarningCircle16Icon width={16} height={16} className="fill-orange mr-1" />
            <span className="text-orange text-sm font-medium">Disconnected</span>
          </div>
        )}
        <p className={`${textColor} text-sm`}>{text}</p>
      </div>

      {/* Action Button */}
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

