"use client";
import { useState } from "react";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ClaimSection from "components/Integrations/Airdrop/ClaimSection";
import EmailNotifications from "components/Integrations/Airdrop/EmailNotifications";
import KlerosInfoCard from "components/Integrations/Airdrop/KlerosInfoCard";
import FeatureList from "components/FeatureList";
import { formatEth } from "utils/misc";
import type { Integration } from "types/integrations";

const HUMANITY_SUBCOURT_ID = 18n;

export interface PnkAirdropClientProps {
  integration: Integration;
  contractData: any;
  airdropChainId: number;
  coherenceReward: bigint;
  gnosisApy: number;
}

export default function PnkAirdropContent({ integration, contractData, airdropChainId, coherenceReward, gnosisApy }: PnkAirdropClientProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slidesCompleted = currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);

  return (
    <div className="flex flex-col w-full md:w-10/12 space-y-8">
      <div className="paper">
        <IntegrationHeader {...{ integration }} />
        <div className="flex flex-col justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
          {!slidesCompleted && integration.firstInfoSlide ? (
            <>
              <div className="text-orange text-center text-md">Learn more about Kleros to unlock the airdrop</div>
              <KlerosInfoCard
                slide={integration.firstInfoSlide[currentSlideIndex]}
                previousStep={currentSlideIndex > 0}
                nextStep={currentSlideIndex <= (integration.firstInfoSlide.length - 1)}
                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              />
            </>
          ) : (
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
                  <div className="mb-2">
                    <FeatureList
                      items={[
                        {
                          text: "Claim your PNK tokens",
                          iconType: 'check'
                        },
                        {
                          text: "Get additional PNK by staking:",
                          iconType: 'check'
                        }
                      ]}
                      spacing="compact"
                      iconWidth={16}
                      iconHeight={16}
                      iconClassName="flex-shrink-0 fill-purple"
                    />
                  </div>
                  <div className="text-xs text-purple mb-5 ml-2">
                    <div className="flex flex-wrap gap-1">
                      <span>Staking APY: {gnosisApy.toFixed(2)}% |</span>
                      <span>Coherence Rewards (Humanity court): {formatEth(coherenceReward)} xDAI</span>
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
                <ClaimSection
                  {...{
                    amountPerClaim: contractData.amountPerClaim,
                    humanitySubcourtId: HUMANITY_SUBCOURT_ID,
                    airdropChainId,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {slidesCompleted ? (
          <div className="flex flex-col justify-center items-center mb-6">
            <EmailNotifications />
          </div>
        ) : null}
      </div>
    </div>
  );
}


