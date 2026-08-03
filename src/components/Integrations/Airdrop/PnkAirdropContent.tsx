"use client";
import { useState } from "react";
import Image from "next/image";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ClaimSection from "components/Integrations/Airdrop/ClaimSection";
import StepCarousel from "components/Integrations/StepCarousel";
import FeatureList from "components/FeatureList";
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
  const [slidesCompleted, setSlidesCompleted] = useState(false);
  const [optimisticClaimed, setOptimisticClaimed] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const slides = integration.firstInfoSlide ?? [];

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
          {!slidesCompleted && slides.length > 0 ? (
            <StepCarousel
              slides={slides}
              onComplete={() => setSlidesCompleted(true)}
              arrowClasses={{
                row: "mt-auto flex items-center gap-3 lg:gap-4",
                enabled: "hover:scale-110",
                disabled: "opacity-[0.12]",
              }}
            >
              {({ slide, arrows }) =>
                slide.juror ? (
                  <JurorSlide {...{ slide, juror: slide.juror, arrows }} />
                ) : (
                  <KlerosSlide {...{ slide, arrows }} />
                )
              }
            </StepCarousel>
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
                      "Double your PNK airdrop by staking for 180 days.",
                      "Earn extra monthly PNK by staking.",
                    ]}
                    className="space-y-1"
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

function SlideBullets({ points }: { points: string[] }) {
  return (
    <FeatureList
      items={points}
      className="space-y-1"
      iconClassName="flex-shrink-0 fill-purple"
      textClassName="text-purple text-sm sm:text-base leading-[1.36] whitespace-pre-line"
    />
  );
}

function SlideFrame({
  slide,
  arrows,
  children,
}: {
  slide: InfoSlide;
  arrows: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-auto w-full max-w-[1095px] flex-col rounded-[30px] border shadow lg:h-[1035px]">
      <div className="flex w-full justify-center overflow-hidden rounded-t-[30px]">
        <div className="mb-2 mt-6 w-full px-4 sm:px-8 lg:mt-12 lg:w-[900px] lg:px-0">
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              width={900}
              height={521}
              className="border-stroke my-4 h-auto max-h-[200px] rounded-xl border shadow sm:my-6 sm:max-h-[300px] md:my-8 md:h-auto md:max-h-[521px]"
            />
          )}
        </div>
      </div>

      <div className="bg-primaryBackground flex flex-1 flex-col rounded-[30px] p-4 sm:p-6 lg:p-8">
        <h2 className="text-primaryText mb-3 text-xl font-semibold leading-[1.36] sm:text-2xl lg:mb-4">
          {slide.title}
        </h2>
        {children}
        {arrows}
      </div>
    </div>
  );
}

function KlerosSlide({
  slide,
  arrows,
}: {
  slide: InfoSlide;
  arrows: React.ReactNode;
}) {
  return (
    <SlideFrame {...{ slide, arrows }}>
      <div className="text-primaryText mb-2 whitespace-pre-line text-sm leading-[1.36] sm:text-base">
        {addLinkToText(slide.description)}
      </div>
      {slide.bulletPoints && slide.bulletPoints.length > 0 && (
        <div className="mb-4 mt-4 lg:mb-6">
          <SlideBullets points={slide.bulletPoints} />
        </div>
      )}
    </SlideFrame>
  );
}

function JurorSlide({
  slide,
  juror,
  arrows,
}: {
  slide: InfoSlide;
  juror: NonNullable<InfoSlide["juror"]>;
  arrows: React.ReactNode;
}) {
  const textBase = "text-sm sm:text-base leading-[1.36]";
  const textSection = `${textBase} mb-3`;
  return (
    <SlideFrame {...{ slide, arrows }}>
      {slide.bulletPoints && slide.bulletPoints.length > 0 && (
        <div className="mb-4 flex items-start gap-2">
          <SlideBullets points={slide.bulletPoints} />
        </div>
      )}

      <div className={`text-primaryText ${textSection}`}>
        {addLinkToText(slide.description)}
      </div>

      <div className={`text-green-600 ${textSection}`}>{juror.highlight}</div>

      <div className={`text-primaryText ${textSection}`}>{juror.staking}</div>

      <div className="mb-4 space-y-1">
        {juror.voteResults.map((result) => (
          <div key={result} className={`text-primaryText ${textBase}`}>
            {result}
          </div>
        ))}
      </div>

      <div className={`text-orange ${textBase} mb-4`}>
        {addLinkToText(juror.links)}
      </div>
    </SlideFrame>
  );
}
