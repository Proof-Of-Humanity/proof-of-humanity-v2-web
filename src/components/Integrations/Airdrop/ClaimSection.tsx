"use client";
import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { getCurrentStake } from "data/airdrop";
import type { ProcessedAirdropData } from "data/airdrop";
import { Address } from "viem";
import { extractErrorMessage } from "utils/errors";
import { prettifyId } from "utils/identifier";
import CheckCircleIcon from "icons/CheckCircle.svg";
import CheckCircleMinorIcon from "icons/CheckCircleMinor.svg";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import CrossCircle16Icon from "icons/CrossCircle16.svg";
import NewTabIcon from "icons/NewTab.svg";
import ActionButton from "components/ActionButton";
import ExternalLink from "components/ExternalLink";
import useBatchWrite from "contracts/hooks/useBatchWrite";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { idToChain, SupportedChainId } from "config/chains";
import { getHumanitySubCourtId } from "data/kleros";
import PnkDisplay from "components/Integrations/Airdrop/PnkDisplay";
import ClaimedPanel from "components/Integrations/Airdrop/ClaimedPanel";
import { ChainSet, configSetSelection } from "contracts";
import { useRouter } from "next/navigation";

export type EligibilityStatus =
  | "disconnected"
  | "wrong-chain"
  | "eligible"
  | "not-eligible"
  | "claimed"
  | "error";

function PnkPulse() {
  return (
    <div className="flex items-center justify-center">
      <div className="border-orange/20 bg-orange/10 rounded-full border p-3 shadow-[0_0_18px_rgba(255,138,102,0.08)]">
        <Image
          src="/logo/pnk-token.svg"
          alt="PNK Token"
          width={44}
          height={44}
          className="animate-pulse"
        />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border-stroke bg-primaryBackground rounded-[30px] border p-6 shadow-[0_0_45px_rgba(255,255,255,0.10)] lg:w-[391px] lg:p-8">
      <div className="text-center">
        <div className="text-orange mb-6 text-sm font-medium">Loading...</div>
        <PnkPulse />
        <div className="text-secondaryText mt-6 text-sm">
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
  optimisticClaimed: boolean;
  setOptimisticClaimed: (claimed: boolean) => void;
}

export default function ClaimSection({
  amountPerClaim,
  airdropChainId,
  eligibilityData,
  isEligibilityLoading,
  eligibilityError,
  refetchEligibilityStatus,
  optimisticClaimed,
  setOptimisticClaimed,
}: ClaimSectionProps) {
  const modal = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const router = useRouter();

  const humanitySubcourtId = getHumanitySubCourtId(airdropChainId);
  const { isLoading: isStakeLoading, error: stakeError } = useQuery<bigint>({
    queryKey: [
      "currentStake",
      address,
      chainId,
      humanitySubcourtId?.toString(),
    ],
    queryFn: async () =>
      getCurrentStake(address as Address, airdropChainId, humanitySubcourtId),
    enabled: !!address && !!chainId,
  });

  const queryErrorMessage = stakeError
    ? "Unable to load staking information. Please check your connection and try again."
    : eligibilityError
      ? "Unable to check eligibility. Please check your connection and try again or try using a EIP-7702 wallet like metamask"
      : null;

  const isFetching = !!isEligibilityLoading || isStakeLoading;
  const hasErrors = !!eligibilityError || !!stakeError;
  const isOnSupportedChain = chainId === airdropChainId;
  const airdropNetworkName = idToChain(airdropChainId)?.name;
  const isTestnet = configSetSelection.chainSet === ChainSet.TESTNETS;

  const eligibilityStatus: EligibilityStatus = !isConnected
    ? "disconnected"
    : !isOnSupportedChain
      ? "wrong-chain"
      : hasErrors
        ? "error"
        : eligibilityData?.claimStatus === "claimed" || optimisticClaimed
          ? "claimed"
          : eligibilityData?.claimStatus === "eligible"
            ? "eligible"
            : "not-eligible";

  const batchWriteEffects = useMemo(
    () => ({
      onFail: (err: any) => {
        const msg = extractErrorMessage(err);
        if (msg.includes("ERC-5792") || msg.toLowerCase().includes("batch")) {
          toast.error(
            "Please use a compatible wallet like MetaMask, and turn on Smart Account (Settings > Advanced > Use Smart Account (ON) to proceed.",
          );
        } else {
          toast.error("Unable to prepare transaction. Please try again.");
        }
      },
      onReady: (fire: () => void) => {
        fire();
      },
      onError: (err: any) => {
        const msg = extractErrorMessage(err);
        if (
          msg.toLowerCase().includes("rejected") ||
          msg.toLowerCase().includes("denied")
        ) {
          toast.error("Transaction rejected");
        } else {
          toast.error("Transaction failed. Please try again.");
        }
      },
      onSuccess: () => {
        toast.success("Successfully claimed and staked PNK tokens!");
        setOptimisticClaimed(true);

        const pollRefetch = async () => {
          // Poll every 4 seconds for 1 minute to allow subgraph to sync
          for (let i = 0; i < 15; i++) {
            await new Promise((resolve) => setTimeout(resolve, 4000));
            const result = await refetchEligibilityStatus?.();
            const data = (result as { data?: ProcessedAirdropData })?.data;

            if (data?.claimStatus === "claimed") {
              break;
            }
          }
        };
        pollRefetch();
      },
    }),
    [refetchEligibilityStatus, setOptimisticClaimed],
  );

  const [prepareBatch, _, txStatus] = useBatchWrite(batchWriteEffects);
  const isTxLoading = txStatus.write === "pending";

  const handleConnectWallet = useCallback(() => {
    modal.open({ view: "Connect" });
  }, [modal]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: airdropChainId });
  }, [switchChain, airdropChainId]);

  const handleClaimAndStake = useCallback(async () => {
    if (!address) return;

    let freshStake: bigint;
    try {
      freshStake = await getCurrentStake(
        address as Address,
        airdropChainId,
        humanitySubcourtId,
      );
    } catch {
      toast.error("Unable to verify your current stake. Please try again.");
      return;
    }

    const newStake = freshStake + amountPerClaim;

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
  }, [
    address,
    amountPerClaim,
    airdropChainId,
    humanitySubcourtId,
    prepareBatch,
  ]);

  const renderActionButton = () => {
    if (eligibilityStatus === "error") return null;

    const getButtonProps = () => {
      switch (eligibilityStatus) {
        case "claimed":
          return {
            onClick: () => {
              router.push("/app");
            },
            label: "Claim More Rewards",
          };
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
            onClick: () => {
              if (!address) return;
              const url = `/${prettifyId(address)}/claim`;
              const opened = window.open(url, "_blank");
              if (opened) opened.opener = null;
              else window.location.assign(url);
            },
            label: "Register",
          };
      }
    };

    const buttonProps = getButtonProps();

    const marginClass = eligibilityStatus === "claimed" ? "mt-6" : "mt-14";
    const widthClass = eligibilityStatus === "claimed" ? "w-full" : "w-44";

    return (
      <div className={`${marginClass} flex justify-center`}>
        <ActionButton {...buttonProps} className={`${widthClass} py-3`} />
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
          icon: (
            <CheckCircleIcon
              width={16}
              height={16}
              className="text-status-registered"
            />
          ),
          text: "Eligible: Verified human",
          textColor: "text-status-registered",
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
          text: "Not eligible:",
          subText: "You need to be a verified human",
          textColor: "text-status-removed",
        };
      case "wrong-chain":
        return {
          icon: (
            <WarningCircle16Icon
              width={16}
              height={16}
              className="fill-orange"
            />
          ),
          text: "Wrong network",
          subText: `Switch to ${airdropNetworkName} network`,
          textColor: "text-orange",
        };
      case "error":
        return {
          icon: (
            <CrossCircle16Icon
              width={16}
              height={16}
              className="fill-red-500"
            />
          ),
          text: "Something went wrong",
          subText: queryErrorMessage || "Please try again later",
          textColor: "text-red-500",
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
          text: "Connect your wallet",
          subText: "Connect to check your eligibility",
          textColor: "text-orange",
        };
    }
  };

  if (isConnected && isOnSupportedChain && isFetching) {
    return <LoadingState />;
  }

  const statusDisplay = getStatusDisplay();

  if (eligibilityStatus === "claimed") {
    return (
      <div className="border-stroke bg-primaryBackground rounded-[30px] border p-6 shadow-[0_0_45px_rgba(255,255,255,0.10)] lg:w-[440px] lg:p-8">
        <div className="text-center">
          {/* key: reset email-form state (modal, editing, draft) on wallet switch */}
          <ClaimedPanel
            key={address ?? "no-address"}
            amountPerClaim={amountPerClaim}
            isTestnet={isTestnet}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-stroke bg-primaryBackground rounded-[30px] border p-6 shadow-[0_0_45px_rgba(255,255,255,0.10)] lg:w-[391px] lg:p-8">
      <div className="text-center">
        <div className="text-purple mb-1.5 text-sm font-medium">Reward</div>
        <PnkDisplay amount={amountPerClaim} />
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2">
            {statusDisplay.icon}
            <span
              className={`text-base font-normal ${statusDisplay.textColor}`}
            >
              {statusDisplay.text}
            </span>
          </div>
          {statusDisplay.subText && (
            <div
              className={`mt-1 ${statusDisplay.textColor} text-sm font-normal`}
            >
              {statusDisplay.subText}
            </div>
          )}
        </div>
        {renderActionButton()}
        <ExternalLink
          href="https://kleros.notion.site/poh-airdrop-faqs"
          className="text-purple mt-4 flex items-center justify-center gap-1 text-sm hover:cursor-pointer hover:opacity-80"
        >
          <span>Trouble claiming?</span>
          <span className="flex items-center gap-1">
            See FAQs
            <NewTabIcon width={12} height={12} />
          </span>
        </ExternalLink>
      </div>
    </div>
  );
}
