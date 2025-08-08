"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { getCurrentStake, getRewardClaimStatus } from "data/airdrop";
import { Address, formatUnits } from "viem";
import CheckCircleIcon from "icons/components/CheckCircle";
import CheckCircleIconMinor from "icons/components/CheckCircleMinor";
import WarningCircleMinor from "icons/components/WarningCircle16";
import CrossCircle from "icons/components/CrossCircle16";
import EmailNotifications, { EmailVerificationStatus } from "components/Integrations/Airdrop/EmailNotifications";
import ActionButton from "components/ActionButton";
import useBatchWrite from "contracts/hooks/useBatchWrite";

export type EligibilityStatus = "disconnected" | "eligible" | "not-eligible" | "claimed";

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

interface StatusDisplay {
  icon: React.ReactNode;
  text: string;
  subText?: string;
  textColor: string;
}

interface ClaimSectionProps {
  amountPerClaim: bigint;
  humanitySubcourtId: bigint;
}

export default function ClaimSection({ amountPerClaim, humanitySubcourtId }: ClaimSectionProps) {
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>("disconnected");
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [currentStake, setCurrentStake] = useState<bigint>(0n);
  const modal = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Notification state (no backend calls for now)
  const [emailVerificationStatus] = useState<EmailVerificationStatus>("unsubscribed");
  const [subscribedEmail] = useState<string>("");
  const [isEmailLoading] = useState(false);

  useEffect(() => {
    if (address && chainId) {
      getCurrentStake(address as Address, chainId as any, humanitySubcourtId).then((stake) => {
        setCurrentStake(stake);
      });
    }
  }, [address, chainId, humanitySubcourtId]);

  const [prepareBatch] = useBatchWrite({
    onFail: () => {
      setIsTransactionLoading(false);
      setError("Your wallet doesn't support atomic batch transactions (ERC-5792). Please use a wallet that supports batch calls.");
    },
    onReady: (fire) => {
      setError(null);
      setIsTransactionLoading(true);
      fire();
    },
    onLoading: () => setIsTransactionLoading(true),
    onError: () => {
      setIsTransactionLoading(false);
      setError("Transaction failed. Please try again.");
    },
    onSuccess: () => {
      setIsTransactionLoading(false);
      setEligibilityStatus("claimed");
      setShowNotificationCard(true);
      setError(null);
    },
  });

  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address || !chainId) {
        setEligibilityStatus("disconnected");
        return;
      }
      try {
        const status = await getRewardClaimStatus(address as Address, chainId as any);
        if (status.claimed) {
          setEligibilityStatus("claimed");
        } else {
          setEligibilityStatus("eligible");
        }
      } catch (e) {
        setEligibilityStatus("not-eligible");
      }
    };
    run();
  }, [isConnected, address, chainId]);

  const handleConnectWallet = useCallback(() => {
    modal.open({ view: "Connect" });
  }, [modal]);

  const handleClaimAndStake = useCallback(() => {
    if (!address) return;

    const newStake = currentStake + amountPerClaim;

    prepareBatch({
      calls: [
        {
          contract: "PnkRewardDistributer",
          functionName: "claim",
          args: [],
        },
        {
          contract: "KlerosLiquid",
          functionName: "setStake",
          args: [humanitySubcourtId, newStake],
        },
      ],
    });
  }, [address, amountPerClaim, currentStake, humanitySubcourtId, prepareBatch]);

  const renderActionButton = () => {
    if (eligibilityStatus === "claimed") return null;

    switch (eligibilityStatus) {
      case "eligible":
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton
              onClick={handleClaimAndStake}
              label="Claim & Stake"
              disabled={isTransactionLoading}
              isLoading={isTransactionLoading}
              className="w-44 py-3"
              variant="primary"
            />
          </div>
        );
      case "disconnected":
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton
              onClick={handleConnectWallet}
              label="Connect wallet"
              disabled={isTransactionLoading}
              isLoading={isTransactionLoading}
              className="w-44 py-3"
              variant="primary"
            />
          </div>
        );
      case "not-eligible":
      default:
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton onClick={() => {}} label="Claim & Stake" disabled={true} className="w-44 py-3" variant="primary" />
          </div>
        );
    }
  };

  const handleSubscribe = async (_email: string) => {};
  const handleResendEmail = async () => {};

  const getStatusDisplay = (): StatusDisplay => {
    switch (eligibilityStatus) {
      case "claimed":
        return {
          icon: <CheckCircleIconMinor />,
          text: "Success!",
          subText: "Claimed & Staked on Humanity court",
          textColor: "text-status-registered",
        };
      case "eligible":
        return {
          icon: <CheckCircleIcon width={16} height={16} className="text-status-registered" />,
          text: "Eligible: Included profile",
          textColor: "text-status-registered",
        };
      case "not-eligible":
        return {
          icon: <CrossCircle width={16} height={16} className="fill-status-removed" />,
          text: "Not eligible:",
          subText: "You need to be an included profile",
          textColor: "text-status-removed",
        };
      case "disconnected":
      default:
        return {
          icon: <WarningCircleMinor width={16} height={16} className="fill-orange" />,
          text: "Connect your wallet",
          textColor: "text-orange",
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isSuccess = eligibilityStatus === "claimed";

  return (
    <>
      {error ? <div className="w-full text-red-500 text-sm mb-2">{error}</div> : null}
      <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-l-[1px] border-l-[#BE75FF]">
        <div className="text-center">
          {isSuccess ? (
            <>
              <div className="mb-6 flex justify-center">{statusDisplay.icon}</div>
              <div className="text-purple text-sm font-medium mb-2">{statusDisplay.text}</div>
              <PnkDisplay amount={amountPerClaim} />
              <div className={`${statusDisplay.textColor} text-base font-normal`}>{statusDisplay.subText}</div>
            </>
          ) : (
            <>
              <div className="text-purple text-sm font-medium mb-1.5">Reward</div>
              <PnkDisplay amount={amountPerClaim} />
              <div className="mt-12">
                <div className="flex items-center justify-center gap-2">
                  {statusDisplay.icon}
                  <span className={`text-base font-normal ${statusDisplay.textColor}`}>{statusDisplay.text}</span>
                </div>
                {statusDisplay.subText && <div className={`mt-1 ${statusDisplay.textColor} text-sm font-normal`}>{statusDisplay.subText}</div>}
              </div>
            </>
          )}
          {renderActionButton()}
        </div>
      </div>

      {showNotificationCard ? (
        <div className="w-full mb-6 max-w-[1095px]">
          <EmailNotifications
            onSubscribe={handleSubscribe}
            onResendEmail={handleResendEmail}
            isLoading={isEmailLoading}
            verificationStatus={emailVerificationStatus}
            subscribedEmail={subscribedEmail}
          />
        </div>
      ) : null}
    </>
  );
}


