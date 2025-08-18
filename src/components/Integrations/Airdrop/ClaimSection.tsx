"use client";
import React, { useCallback, useMemo } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { getCurrentStake } from "data/airdrop";
import type { ProcessedAirdropData } from "data/airdrop";
import { Address } from "viem";
import { extractErrorMessage } from "utils/errors";
import CheckCircleIcon from "icons/CheckCircle.svg";
import CheckCircleMinorIcon from "icons/CheckCircleMinor.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import CrossCircle16Icon from "icons/CrossCircle16.svg";
import ActionButton from "components/ActionButton";
import useBatchWrite from "contracts/hooks/useBatchWrite";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { idToChain, SupportedChainId } from "config/chains";
import { getHumanitySubCourtId } from "data/kleros";
import PnkDisplay from "components/Integrations/Airdrop/PnkDisplay";

export type EligibilityStatus = "disconnected" | "wrong-chain" | "eligible" | "not-eligible" | "claimed" | "error";
 

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple"></div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-l-[1px] border-l-[#BE75FF]">
      <div className="text-center">
        <div className="text-purple text-sm font-medium mb-6">Loading...</div>
        <LoadingSpinner />
        <div className="mt-6 text-secondaryText text-sm">
          Checking eligibility and fetching data...
        </div>
      </div>
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
  airdropChainId: SupportedChainId;
  eligibilityData?: ProcessedAirdropData;
  isEligibilityLoading?: boolean;
  eligibilityError?: unknown;
  refetchEligibilityStatus?: () => Promise<unknown>;
}

export default function ClaimSection({ amountPerClaim, airdropChainId, eligibilityData, isEligibilityLoading, eligibilityError, refetchEligibilityStatus }: ClaimSectionProps) {
  const modal = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const humanitySubcourtId = getHumanitySubCourtId(airdropChainId);
  const { data: currentStake = 0n, isLoading: isStakeLoading, error: stakeError } = useQuery<bigint>({
    queryKey: ["currentStake", address, chainId, humanitySubcourtId?.toString()],
    queryFn: async () => getCurrentStake(address as Address, airdropChainId, humanitySubcourtId),
    enabled: !!address && !!chainId,
  });

  const queryErrorMessage =
    stakeError
      ? "Unable to load staking information. Please check your connection and try again."
      : eligibilityError
      ? "Unable to check eligibility. Please check your connection and try again."
      : null;

  const isFetching = !!isEligibilityLoading || isStakeLoading;
  const hasErrors = !!eligibilityError || !!stakeError;
  const isOnSupportedChain = chainId === airdropChainId;
  const airdropNetworkName = idToChain(airdropChainId)?.name;

  const eligibilityStatus: EligibilityStatus = !isConnected
    ? "disconnected"
    : !isOnSupportedChain
    ? "wrong-chain"
    : hasErrors
    ? "error"
    : eligibilityData?.claimStatus === "claimed"
    ? "claimed"
    : eligibilityData?.claimStatus === "eligible"
    ? "eligible"
    : "not-eligible";

  const batchWriteEffects = useMemo(() => ({
    onFail: (err: any) => {
      const msg = extractErrorMessage(err);
      if (msg.includes("ERC-5792") || msg.toLowerCase().includes("batch")) {
        toast.error("Please use a compatible wallet like MetaMask.");
      } else {
        toast.error("Unable to prepare transaction. Please try again.");
      }
    },
    onReady: (fire: () => void) => {
      fire();
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied")) {
        toast.error("Transaction rejected");
      }
      else{
        toast.error("Transaction failed. Please try again.");
      }
    },
    onSuccess: () => {
      toast.success("Successfully claimed and staked PNK tokens!");
      setTimeout(() => {
        refetchEligibilityStatus?.();
      }, 1000);
    },
  }), [refetchEligibilityStatus]);

  const [prepareBatch, _, txStatus] = useBatchWrite(batchWriteEffects);
  const isTxLoading = txStatus.write === "pending";

  const handleConnectWallet = useCallback(() => {
    modal.open({ view: "Connect" });
  }, [modal]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: airdropChainId });
  }, [switchChain, airdropChainId]);

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
    // No action button for claimed or error states
    if (eligibilityStatus === "claimed" || eligibilityStatus === "error") return null;

    const getButtonProps = () => {
      switch (eligibilityStatus) {
        case "eligible":
          return {
            onClick: handleClaimAndStake,
            label: "Claim & Stake",
            isLoading: isTxLoading,
          };
        case "disconnected":
          return {
            onClick: handleConnectWallet,
            label: "Connect wallet",
          };
        case "wrong-chain":
          return {
            onClick: handleSwitchChain,
            label: "Switch Chain",
          };
        case "not-eligible":
        default:
          return {
            onClick: () => {},
            label: "Claim & Stake",
            disabled: true,
          };
      }
    };

    const buttonProps = getButtonProps();

    return (
      <div className="mt-14 flex justify-center">
        <ActionButton
          {...buttonProps}
          className="w-44 py-3"
        />
      </div>
    );
  };

  const getStatusDisplay = (): StatusDisplay => {
    switch (eligibilityStatus) {
      case "claimed":
        return {
          icon: <CheckCircleMinorIcon width={64} height={64} />,
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
          icon: <CrossCircle16Icon width={16} height={16} className="fill-status-removed" />,
          text: "Not eligible:",
          subText: "You need to be an included profile",
          textColor: "text-status-removed",
        };
      case "wrong-chain":
        return {
          icon: <WarningCircle16Icon width={16} height={16} className="fill-orange" />,
          text: "Wrong network",
          subText: `Switch to ${airdropNetworkName} network`,
          textColor: "text-orange",
        };
      case "error":
        return {
          icon: <CrossCircle16Icon width={16} height={16} className="fill-red-500" />,
          text: "Something went wrong",
          subText: queryErrorMessage || "Please try again later",
          textColor: "text-red-500",
        };
      case "disconnected":
      default:
        return {
          icon: <WarningCircle16Icon width={16} height={16} className="fill-orange" />,
          text: "Connect your wallet",
          textColor: "text-orange",
        };
    }
  };

  // Show loading state when connected, on supported chain, but data is still loading
  if (isConnected && isOnSupportedChain && isFetching) {
    return <LoadingState />;
  }

  const statusDisplay = getStatusDisplay();
  return (
    <div className="lg:w-[391px] p-6 lg:p-8 bg-whiteBackground rounded-[30px] border-l-[1px] border-l-[#BE75FF]">
      <div className="text-center">
        { eligibilityStatus === "claimed" ? (
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
  );
}


