"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ProcessStepCard from "components/Integrations/ProcessStepCard";
import SeerStatusCard, { SeerEligibilityStatus } from "./SeerStatusCard";
import type { Integration } from "types/integrations";
import ExternalLink from "components/ExternalLink";
import { useAccount, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { prettifyId } from "utils/identifier";
import { sdk } from "config/subgraph";
import { Address } from "viem";
import { supportedChains, SupportedChainId } from "config/chains";

interface SeerCreditsProps {
  integration: Integration;
}

export default function SeerCredits({ integration }: SeerCreditsProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const modal = useAppKit();

  const slidesCompleted = currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);

  // Query to check if user has an included profile (checking registrations and cross-chain registrations)
  const { data: userData, isLoading } = useQuery({
    queryKey: ["seerEligibility", address, chainId],
    queryFn: async () => {
      if (!address) return null;
      
      const normalizedAddress = address.toLowerCase() as Address;
      const now = Math.ceil(Date.now() / 1000);

      const results = await Promise.all(
        supportedChains.map(async (chain) => {
          try {
            const data = await sdk[chain.id as SupportedChainId].HumanityIdByClaimer({ 
              address: normalizedAddress, 
              now 
            });

            const localRegistration = data?.registrations?.[0];
            if (localRegistration?.humanity?.id) {
              return {
                hasValidRegistration: true,
                humanityId: localRegistration.humanity.id,
                chainId: chain.id
              };
            }

            const crossChainRegistration = data?.crossChainRegistrations?.[0];
            if (crossChainRegistration?.id) {
              return {
                hasValidRegistration: true,
                humanityId: crossChainRegistration.id,
                chainId: chain.id
              };
            }
            
            return { hasValidRegistration: false, humanityId: null, chainId: chain.id };
          } catch (error) {
            console.error(`Error checking chain ${chain.id}:`, error);
            return { hasValidRegistration: false, humanityId: null, chainId: chain.id };
          }
        })
      );

      return results.find(r => r.hasValidRegistration) || { hasValidRegistration: false, humanityId: null };
    },
    enabled: isConnected && !!address,
  });


  const eligibilityStatus: SeerEligibilityStatus = useMemo(() => {
    if (!isConnected) return "disconnected";
    if (isLoading) return "disconnected";
    if (userData?.hasValidRegistration) {
      return "eligible";
    }
    return "not-eligible";
  }, [isConnected, isLoading, userData]);

  const handleActionClick = useCallback(() => {
    switch (eligibilityStatus) {
      case "eligible":
        window.open("https://app.seer.pm/", "_blank");
        break;
      case "not-eligible":
        if (address) {
          const opened = window.open(
            `/${prettifyId(address)}/claim`,
            "_blank",
            "noopener,noreferrer",
          );
          if (!opened) window.location.assign(`/${prettifyId(address)}/claim`);
        }
        break;
      case "disconnected":
        modal.open({ view: "Connect" });
        break;
    }
  }, [eligibilityStatus, modal, address]);

  return (
    <div className="flex flex-col w-full md:w-10/12 space-y-8">
      <div className="paper">
        <IntegrationHeader {...{ integration }} />
        <div className="flex flex-col justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
          {!slidesCompleted && integration.firstInfoSlide ? (
            <>
              <ExternalLink 
                href="https://seer.pm/" 
                className="text-purple text-center text-md my-4"
              >
                Learn more about Seer to get started
              </ExternalLink>
              <ProcessStepCard
                step={integration.firstInfoSlide[currentSlideIndex]}
                allSlides={integration.firstInfoSlide}
                currentIndex={currentSlideIndex}
                previousStep={currentSlideIndex > 0}
                nextStep={currentSlideIndex < integration.firstInfoSlide.length - 1}
                isLastSlide={currentSlideIndex === integration.firstInfoSlide.length - 1}
                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                onLastSlideComplete={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              />
            </>
          ) : (
            <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
              <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">
                <div className="flex-1 p-6 lg:p-8">
                  <h2 className="text-primaryText text-xl md:text-2xl font-semibold mb-4">
                    Claim and use your Seer Credits
                  </h2>
                  <div className="mb-4">
                    <p className="text-secondaryText text-sm mb-2">
                      To qualify, you must be an Included profile.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-purple text-base md:text-lg font-semibold">
                      Get monthly Seer Credits to predict, play and earn on Seer!
                    </p>
                    
                    <div className="text-secondaryText text-sm leading-relaxed space-y-3">
                      <p>
                        Seer Credits are monthly rewards given to verified Proof of Humanity users to use on 
                        the Seer Prediction Market platform.
                      </p>
                      
                      <p>
                        Seer Credits refresh every month, so you'll receive a new balance automatically. Use 
                        them before the month ends. Unused credits expire when the next cycle begins.
                      </p>
                    </div>
                  </div>
                </div>

                <SeerStatusCard
                  status={eligibilityStatus}
                  onActionClick={handleActionClick}
                  isLoading={isLoading && isConnected}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
