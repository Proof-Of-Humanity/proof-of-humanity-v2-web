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
import { getProcessedAirdropData, type ProcessedAirdropData } from "data/airdrop";
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

export default function PnkAirdropContent({ integration, contractData, airdropChainId, coherenceReward, gnosisApy }: PnkAirdropClientProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [optimisticClaimed, setOptimisticClaimed] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const slidesCompleted = currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);

  // Preload all slide images on component mount
  useEffect(() => {
    if (integration.firstInfoSlide) {
      integration.firstInfoSlide.forEach((slide) => {
        if (slide.image) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = slide.image;
          document.head.appendChild(link);
        }
      });
    }
  }, [integration.firstInfoSlide]);

  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError, refetch: refetchEligibilityStatus } = useQuery<ProcessedAirdropData>({
    queryKey: ["eligibilityStatus", address, chainId, airdropChainId],
    queryFn: async () => getProcessedAirdropData(address as Address, airdropChainId),
    enabled: isConnected && !!address && !!chainId,
  });

  return (
    <div className="flex flex-col w-full md:w-10/12 space-y-8">
      <div className="paper">
        <IntegrationHeader {...{ integration }} />
        <div className="flex flex-col justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
          {!slidesCompleted && integration.firstInfoSlide ? (
            <>
              <KlerosInfoCard
                slide={integration.firstInfoSlide[currentSlideIndex]}
                previousStep={currentSlideIndex > 0}
                nextStep={currentSlideIndex < (integration.firstInfoSlide.length - 1)}
                isLastSlide={currentSlideIndex === (integration.firstInfoSlide.length - 1)}
                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                onLastSlideComplete={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              />
            </>
          ) : (
            <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
              <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">
                <div className="flex-1 p-6 lg:p-8 space-y-2">
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
                        iconType: 'check'
                      },
                      {
                        text: "Earn extra monthly PNK by staking.",
                        iconType: 'check'
                      }
                    ]}
                    spacing="compact"
                    iconWidth={16}
                    iconHeight={16}
                    iconClassName="flex-shrink-0 fill-purple"
                  />

                  <div className="text-xs text-purple ml-1">
                    <div className="flex flex-wrap gap-1">
                      <span>Staking APY: {gnosisApy.toFixed(2)}% |</span>
                      <span>Coherence Rewards (Humanity Court): {formatEth(coherenceReward)} xDAI + PNK</span>
                    </div>
                    <p className="mt-1 italic font-light">
                      (Values subject to change) The Coherence Rewards depend on how you vote.
                    </p>
                  </div>

                  <p className="text-secondaryText text-sm leading-relaxed">
                    By staking your PNK tokens on the Humanity court, you become eligible to serve as a juror and earn additional rewards. Staking helps secure the network and gives you voting power in dispute resolution. The longer you stake, the higher your potential rewards.
                  </p>

                  <div className="text-secondaryText text-xs border-l-2 border-purple pl-2">
                    <strong>Note:</strong> Your staked PNK is locked and may be used to vote in disputes. Missing voting deadlines may result in stake penalties.
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


