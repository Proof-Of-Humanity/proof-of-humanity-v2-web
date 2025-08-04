"use client";
import React, { useState } from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";
import ActionButton from "components/ActionButton";
import LawBalance from "icons/LawBalance.svg";
import Field from "components/Field";

export interface NotificationCardProps {
  onSubscribe?: (email: string) => void;
  isLoading?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  onSubscribe,
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email && onSubscribe) {
      onSubscribe(email);
    }
  };

  return (
    <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#BE75FF] to-[#F9BFCE]">
      <div className="rounded-[29px] bg-primaryBackground p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <LawBalance />
        <span className="text-purple text-sm font-medium">
          Congratulations! Now, you are staked on Humanity court!
        </span>
      </div>

      {/* Title */}
      <h2 className="text-primaryText text-2xl font-semibold mb-4">
        Don't forget to subscribe for notifications!
      </h2>

      {/* Description */}
      <p className="text-primaryText text-sm mb-4 leading-relaxed">
        We'll remind you when your actions are required on the Humanity court, and send you notifications on key moments to help you achieve the best of Kleros.
      </p>
      
      <p className="text-secondaryText text-sm mb-6 leading-relaxed">
        Why Subscribe? Because missing a juror draw means missing rewards, reputation, and your chance to help shape decentralized justice.
      </p>

      {/* Benefits */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2 mt-2">
          <CheckCircleIcon width={16} height={16} className="fill-purple mt-1 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-primaryText text-sm">
              Get a heads-up the moment you're drawn as a juror. No more missed cases, no more lost rewards.
            </span>
            <div className="text-primaryText text-sm">
              The email address is used exclusively for notifications.
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CheckCircleIcon width={16} height={16} className="fill-purple mt-0.5 flex-shrink-0" />
          <span className="text-primaryText text-sm">
            Voting on time = getting paid.
          </span>
        </div>
      </div>

      {/* Email Input and Subscribe Button */}
      <div className="space-y-4 ">
        <div>
          <label htmlFor="email" className="block text-orange text-sm font-medium mb-2 uppercase">
            EMAIL
          </label>
          <div className="flex flex-col sm:flex-row">
            <Field
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="myemail@email.com"
              className="flex-1 px-4 py-3 border-2 border-orange rounded-lg text-primaryText placeholder-secondaryText focus:outline-none focus:border-purple"
              disabled={isLoading}
            />
            <ActionButton
              onClick={handleSubscribe}
              label="Subscribe"
              disabled={!email || isLoading}
              isLoading={isLoading}
              className="sm:w-auto px-8"
              variant="primary"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default NotificationCard;