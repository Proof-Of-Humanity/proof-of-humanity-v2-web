"use client";
import React from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";
import CheckCircleIconMinor from "icons/CheckCircleMinor.svg";
import WarningCircleMinor from "icons/WarningCircle16.svg";
import CrossCircle from "icons/CrossCircle16.svg";
import ActionButton from "components/ActionButton";
import Image from "next/image";

export type EligibilityStatus = 'disconnected' | 'eligible' | 'not-eligible' | 'claimed';

export interface StatusDisplay {
  icon: React.ReactNode;
  text: string;
  subText?: string;
  textColor: string;
}

export interface PnkAirdropClaimProps {
  eligibilityStatus: EligibilityStatus;
  onConnectWallet?: () => void;
  onClaimAndStake?: () => void;
  isLoading?: boolean;
}

const PnkAirdropClaim: React.FC<PnkAirdropClaimProps> = ({
  eligibilityStatus,
  onConnectWallet,
  onClaimAndStake,
  isLoading = false,
}) => {

  const PnkAmountDisplay = ({ amount = "2.5k PNK" }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <Image src="/logo/pnk-token.svg" alt="PNK Token" width={24} height={24} />
      <span className="text-primaryText text-2xl font-normal">{amount}</span>
    </div>
  );


  const SuccessStateDisplay = ({ statusDisplay }: { statusDisplay: StatusDisplay }) => (
    <>
      <div className="mb-6 flex justify-center">
        {statusDisplay.icon}
      </div>
      
      <div className="text-purple text-sm font-medium mb-2">{statusDisplay.text}</div>
      <PnkAmountDisplay />
      <div className={`${statusDisplay.textColor} text-base font-normal`}>
        {statusDisplay.subText}
      </div>
    </>
  );


  const DefaultStateDisplay = ({ statusDisplay }: { statusDisplay: StatusDisplay }) => (
    <>
      <div className="text-purple text-sm font-medium mb-1.5">Reward</div>
      <PnkAmountDisplay />
      <div className="mt-12">
        <div className="flex items-center justify-center gap-2">
          {statusDisplay.icon}
          <span className={`text-base font-normal ${statusDisplay.textColor}`}>
            {statusDisplay.text}
          </span>
        </div>
        {statusDisplay.subText && (
          <div className={`text-base ${statusDisplay.textColor}`}>
            {statusDisplay.subText}
          </div>
        )}
      </div>


      <div className="mt-14 flex justify-center">
        {getActionButton()}
      </div>
    </>
  );

  const getStatusDisplay = () => {
    switch (eligibilityStatus) {
      case 'claimed':
        return {
          icon: <CheckCircleIconMinor/>,
          text: "Success!",
          subText: "Claimed & Staked on Humanity court",
          textColor: "text-status-registered",
        };
      case 'eligible':
        return {
          icon: <CheckCircleIcon width={16} height={16} className="text-status-registered" />,
          text: "Eligible: Included profile",
          textColor: "text-status-registered",
        };
      case 'not-eligible':
        return {
          icon: <CrossCircle width={16} height={16} className="fill-status-removed" />,
          text: "Not eligible:",
          subText: "You need to be an included profile",
          textColor: "text-status-removed",
        };
      case 'disconnected':
      default:
        return {
          icon: <WarningCircleMinor className="w-4 h-4" />,
          text: "Disconnected",
          subText: "Connect to check your eligibility",
          textColor: "text-orange",
        };
    }
  };

  const getActionButton = () => {
    switch (eligibilityStatus) {
      case 'claimed':
        return null;
      case 'eligible':
        return (
          <ActionButton
            onClick={onClaimAndStake || (() => {})}
            label="Claim & Stake"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-44 py-3"
            variant="primary"
          />
        );
      case 'disconnected':
        return (
          <ActionButton
            onClick={onConnectWallet || (() => {})}
            label="Connect wallet"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-44 py-3"
            variant="primary"
          />
        );
      case 'not-eligible':
      default:
        return (
          <ActionButton
            onClick={() => {}}
            label="Claim & Stake"
            disabled={true}
            className="w-44 py-3"
            variant="primary"
          />
        );
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
      <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">

      <div className="flex-1 p-6 lg:p-8">
        <h2 className="text-primaryText text-2xl font-semibold mb-4">
          Claim & Stake your PNK airdrop
        </h2>
        
        <div className="mb-4">
          <p className="text-secondaryText text-sm mb-2">
            To qualify, you must be an included profile.
          </p>
          <p className="text-secondaryText text-sm mb-6">
            Claim & Stake your airdrop on the Humanity court. Deadline: December 31, 2025.
          </p>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex items-center">
            <div className=" flex-shrink-0 mr-1">
              <CheckCircleIcon width={16} height={16} className="fill-purple" />
            </div>
            <span>Claim your PNK tokens</span>
          </div>
          
          <div className="flex items-center text-primaryText text-base">
            <div className="flex-shrink-0 mr-1">
              <CheckCircleIcon width={16} height={16} className="fill-purple" />
            </div>
              <span>Get additional PNK by staking:</span>
          </div>
        </div>
        <div className="text-xs text-purple mb-5 ml-2">
                <div className="flex flex-wrap gap-1 ">
                  <span>Staking APY: 4% |</span>
                  <span>Coherence Rewards (Humanity court): y PNK + wETH</span>
                </div>
                <p className="mt-1 italic font-light">
                  (Values subject to change) The Coherence Rewards depend on how you vote.
                </p>
              </div>

        <div className="text-secondaryText text-sm leading-relaxed">
          By staking, you'll have the chance to be selected as a juror, earn arbitration fees, receive monthly 
          rewards through the Juror Incentive Program and become eligible for our next airdrop.
        </div>
      </div>


      <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-l-[1px] border-l-[#BE75FF]">
        <div className="text-center">
          {eligibilityStatus === 'claimed' ? (
            <SuccessStateDisplay statusDisplay={statusDisplay} />
          ) : (
            <DefaultStateDisplay statusDisplay={statusDisplay} />
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PnkAirdropClaim;