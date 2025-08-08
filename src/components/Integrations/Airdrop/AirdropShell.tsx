import React from "react";
import Image from "next/image";
import { formatUnits } from "viem";
import CheckCircleIcon from "icons/CheckCircle.svg";
import CheckCircleIconMinor from "icons/CheckCircleMinor.svg";
import WarningCircleMinor from "icons/WarningCircle16.svg";
import CrossCircle from "icons/CrossCircle16.svg";

export type EligibilityStatus = 'disconnected' | 'eligible' | 'not-eligible' | 'claimed';

interface AirdropShellProps {
  eligibilityStatus: EligibilityStatus;
  amountPerClaim?: bigint;
  children?: React.ReactNode;
}

interface StatusDisplay {
  icon: React.ReactNode;
  text: string;
  subText?: string;
  textColor: string;
}

function formatPnkAmount(amount: bigint): string {
  const formatted = formatUnits(amount, 18);
  const num = parseFloat(formatted);
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k PNK`;
  }
  return `${num.toFixed(0)} PNK`;
}

function PnkDisplay({ amount }: { amount?: bigint }) {
  const displayText = amount ? formatPnkAmount(amount) : "";

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <Image src="/logo/pnk-token.svg" alt="PNK Token" width={24} height={24} />
      <span className="text-primaryText text-2xl font-normal">{displayText}</span>
    </div>
  );
}

export default function AirdropShell({ 
  eligibilityStatus, 
  amountPerClaim,
  children 
}: AirdropShellProps) {
  const getStatusDisplay = (): StatusDisplay => {
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
          icon: <WarningCircleMinor width={16} height={16} className="fill-orange" />,
          text: "Connect your wallet",
          textColor: "text-orange",
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isSuccess = eligibilityStatus === 'claimed';

  return (
    <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
      <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">
        
        {/* Left side - Static content */}
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
              <div className="flex-shrink-0 mr-1">
                <svg width={16} height={16} className="fill-purple" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
                </svg>
              </div>
              <span>Claim your PNK tokens</span>
            </div>
            
            <div className="flex items-center text-primaryText text-base">
              <div className="flex-shrink-0 mr-1">
                <svg width={16} height={16} className="fill-purple" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
                </svg>
              </div>
              <span>Get additional PNK by staking:</span>
            </div>
          </div>
          
          <div className="text-xs text-purple mb-5 ml-2">
            <div className="flex flex-wrap gap-1">
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

        {/* Right side - Status and action */}
        <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-l-[1px] border-l-[#BE75FF]">
          <div className="text-center">
            {isSuccess ? (
              <>
                <div className="mb-6 flex justify-center">
                  {statusDisplay.icon}
                </div>
                
                <div className="text-purple text-sm font-medium mb-2">{statusDisplay.text}</div>
                <PnkDisplay amount={amountPerClaim} />
                <div className={`${statusDisplay.textColor} text-base font-normal`}>
                  {statusDisplay.subText}
                </div>
              </>
            ) : (
              <>
                <div className="text-purple text-sm font-medium mb-1.5">Reward</div>
                <PnkDisplay amount={amountPerClaim} />
                <div className="mt-12">
                  <div className="flex items-center justify-center gap-2">
                    {statusDisplay.icon}
                    <span className={`text-base font-normal ${statusDisplay.textColor}`}>
                      {statusDisplay.text}
                    </span>
                  </div>
                  {statusDisplay.subText && (
                    <div className={`mt-1 ${statusDisplay.textColor} text-sm font-normal`}>
                      {statusDisplay.subText}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Client-side interactive button goes here */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
