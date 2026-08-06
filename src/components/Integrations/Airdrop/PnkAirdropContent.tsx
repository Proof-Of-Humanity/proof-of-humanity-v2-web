"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ClaimSection from "components/Integrations/Airdrop/ClaimSection";
import BecomeJurorCard from "components/Integrations/Airdrop/BecomeJurorCard";
import StepCarousel from "components/Integrations/StepCarousel";
import FeatureList, { type FeatureItem } from "components/FeatureList";
import { addLinkToText } from "components/addLinkToText";
import { formatEth } from "utils/misc";
import type { Integration, InfoSlide } from "types/integrations";
import { SupportedChainId } from "config/chains";
import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  getProcessedAirdropData,
  type ProcessedAirdropData,
} from "data/airdrop";
import type { Address } from "viem";

export interface PnkAirdropContentProps {
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
}: PnkAirdropContentProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // Keyed by address so an optimistic "claimed" flag from wallet A never leaks into wallet B's view after an account switch.
  const [optimisticClaimedFor, setOptimisticClaimedFor] = useState<
    string | undefined
  >();
  const { address, isConnected } = useAccount();
  const optimisticClaimed =
    !!address && optimisticClaimedFor === address.toLowerCase();
  const setOptimisticClaimed = useCallback(
    (claimed: boolean) =>
      setOptimisticClaimedFor(claimed ? address?.toLowerCase() : undefined),
    [address],
  );
  const chainId = useChainId();

  const slidesCompleted =
    currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);
  const currentSlide = integration.firstInfoSlide?.[currentSlideIndex];

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
    <div className="flex w-full max-w-[1200px] flex-col space-y-8 md:w-10/12">
      <div className="flex flex-col gap-3">
        <IntegrationHeader {...{ integration }} />
        {!slidesCompleted && integration.firstInfoSlide && currentSlide ? (
          <div className="paper flex flex-col items-center justify-center space-y-4 px-4 py-2 md:px-8 md:py-4">
            <StepCarousel
              slides={integration.firstInfoSlide}
              currentIndex={currentSlideIndex}
              className="mx-auto grid w-full max-w-[1095px]"
              onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
              onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              onLastSlideComplete={() =>
                setCurrentSlideIndex(currentSlideIndex + 1)
              }
            >
              {({ slide, index }) =>
                slide.id === "becomeJuror" ? (
                  <BecomeJurorCard slide={slide} className="flex-1" />
                ) : (
                  <KlerosSlide {...{ slide, index }} />
                )
              }
            </StepCarousel>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="border-stroke bg-whiteBackground relative flex flex-col rounded-[30px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex-row lg:items-stretch">
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
                  iconClassName="flex-shrink-0 fill-status-registered"
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
                  Staking helps secure the network and gives you voting power in
                  dispute resolution. The longer you stake, the higher your
                  potential rewards.
                </p>

                <div className="text-secondaryText border-orange border-l-2 pl-2 text-xs leading-relaxed">
                  <strong className="text-orange">Important:</strong> Unstaking
                  your PNK immediately after the airdrop may make you ineligible
                  for other Proof of Humanity rewards.
                </div>

                <div className="text-secondaryText border-purple border-l-2 pl-2 text-xs">
                  <strong>Note:</strong> Your staked PNK is locked and may be
                  used to vote in disputes. Missing voting deadlines may result
                  in stake penalties.
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
  );
}

function KlerosSlide({ slide, index }: { slide: InfoSlide; index: number }) {
  return (
    <>
      {slide.image && (
        <div className="mt-4 flex w-full justify-center px-2 sm:px-6 lg:mt-6">
          <Image
            src={slide.image}
            alt={slide.title}
            width={900}
            height={521}
            className="h-auto w-full max-w-[900px] rounded-2xl"
            priority={index === 0}
          />
        </div>
      )}

      <div className="border-stroke mx-2 mt-6 border-t sm:mx-6 lg:mt-8" />

      <div className="flex flex-1 flex-col px-2 pt-5 sm:px-6 lg:pt-6">
        <h2 className="text-primaryText mb-3 text-xl font-semibold leading-[1.36] sm:text-2xl lg:mb-4">
          {slide.title}
        </h2>

        <div className="text-secondaryText mb-2 whitespace-pre-line text-sm leading-relaxed sm:text-base">
          {addLinkToText(slide.description)}
        </div>

        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <div className="mb-4 mt-4 lg:mb-6">
            <FeatureList
              items={slide.bulletPoints.map(
                (point): FeatureItem => ({
                  text: point,
                  iconType: "check",
                }),
              )}
              spacing="compact"
              iconWidth={20}
              iconHeight={20}
              iconClassName="flex-shrink-0 fill-status-registered"
              textClassName="text-status-registered text-sm sm:text-base leading-[1.36] whitespace-pre-line"
              className=""
            />
          </div>
        )}
      </div>
    </>
  );
}
