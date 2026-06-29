"use client";
import { useState, useEffect } from "react";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ClaimSection from "components/Integrations/Airdrop/ClaimSection";
import KlerosInfoCard from "components/Integrations/Airdrop/KlerosInfoCard";
import FeatureList from "components/FeatureList";
import { formatEth } from "utils/misc";
import type { Integration } from "types/integrations";
import { SupportedChainId } from "config/chains";
import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  getProcessedAirdropData,
  type ProcessedAirdropData,
} from "data/airdrop";
import type { Address } from "viem";

export interface PnkAirdropClientProps {
  integration: Integration;
  contractData: {
    amountPerClaim: bigint;
  };
  airdropChainId: SupportedChainId;
  coherenceReward: bigint;
  gnosisApy: number;
}

export default function PnkAirdropContent({
  integration,
  contractData,
  airdropChainId,
  coherenceReward,
  gnosisApy,
}: PnkAirdropClientProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [optimisticClaimed, setOptimisticClaimed] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const slidesCompleted =
    currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);
  const currentSlide = integration.firstInfoSlide?.[currentSlideIndex];

  // Preload all slide images on component mount
  useEffect(() => {
    if (integration.firstInfoSlide) {
      integration.firstInfoSlide.forEach((slide) => {
        if (slide.image) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = slide.image;
          document.head.appendChild(link);
        }
      });
    }
  }, [integration.firstInfoSlide]);

  const {
    data: eligibilityData,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
    refetch: refetchEligibilityStatus,
  } = useQuery<ProcessedAirdropData>({
    queryKey: ["eligibilityStatus", address, chainId, airdropChainId],
    queryFn: async () =>
      getProcessedAirdropData(address as Address, airdropChainId),
    enabled: isConnected && !!address && !!chainId,
  });

  return (
    <div className="flex w-full flex-col space-y-8 md:w-10/12">
      <div className="paper">
        <IntegrationHeader {...{ integration }} />
        <div className="flex flex-col items-center justify-center space-y-4 px-4 py-2 md:px-8 md:py-4">
          {!slidesCompleted && integration.firstInfoSlide && currentSlide ? (
            <>
              <KlerosInfoCard
                slide={currentSlide}
                previousStep={currentSlideIndex > 0}
                nextStep={
                  currentSlideIndex < integration.firstInfoSlide.length - 1
                }
                isLastSlide={
                  currentSlideIndex === integration.firstInfoSlide.length - 1
                }
                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                onLastSlideComplete={() =>
                  setCurrentSlideIndex(currentSlideIndex + 1)
                }
              />
            </>
          ) : (
            <div className="mx-auto w-full max-w-[1095px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF] p-[1px]">
              <div className="bg-primaryBackground flex flex-col rounded-[29px] lg:flex-row">
                <div className="flex-1 space-y-2 p-6 lg:p-8">
                  <h2 className="text-primaryText text-2xl font-semibold">
                    Claim & Stake your PNK airdrop
                  </h2>

                  <div className="space-y-1">
                    <p className="text-secondaryText text-sm">
                      To qualify, you must be an included profile.
                    </p>
                    <p className="text-secondaryText text-sm">
                      Claim & Stake your airdrop on the Humanity court.
                    </p>
                  </div>

                  <FeatureList
                    items={[
                      {
                        text: "Double your PNK airdrop by staking for 180 days.",
                        iconType: "check",
                      },
                      {
                        text: "Earn extra monthly PNK by staking.",
                        iconType: "check",
                      },
                    ]}
                    spacing="compact"
                    iconWidth={16}
                    iconHeight={16}
                    iconClassName="flex-shrink-0 fill-purple"
                  />

                  <div className="text-purple ml-1 text-xs">
                    <div className="flex flex-wrap gap-1">
                      <span>Staking APY: {gnosisApy.toFixed(2)}% |</span>
                      <span>
                        Coherence Rewards (Humanity Court):{" "}
                        {formatEth(coherenceReward)} xDAI + PNK
                      </span>
                    </div>
                    <p className="mt-1 font-light italic">
                      (Values subject to change) The Coherence Rewards depend on
                      how you vote.
                    </p>
                  </div>

                  <p className="text-secondaryText text-sm leading-relaxed">
                    By staking your PNK tokens on the Humanity court, you become
                    eligible to serve as a juror and earn additional rewards.
                    Staking helps secure the network and gives you voting power
                    in dispute resolution. The longer you stake, the higher your
                    potential rewards.
                  </p>

                  <div className="text-secondaryText border-orange border-l-2 pl-2 text-xs leading-relaxed">
                    <strong className="text-orange">Important:</strong>{" "}
                    Unstaking your PNK immediately after the airdrop may make you
                    ineligible for other Proof of Humanity rewards.
                  </div>

                  <div className="text-secondaryText border-purple border-l-2 pl-2 text-xs">
                    <strong>Note:</strong> Your staked PNK is locked and may be
                    used to vote in disputes. Missing voting deadlines may
                    result in stake penalties.
                  </div>
                </div>
                <ClaimSection
                  {...{
                    amountPerClaim: contractData.amountPerClaim,
                    airdropChainId,
                    eligibilityData,
                    isEligibilityLoading,
                    eligibilityError,
                    refetchEligibilityStatus,
                    optimisticClaimed,
                    setOptimisticClaimed,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
