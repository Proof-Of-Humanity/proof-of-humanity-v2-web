"use client";
import { useState } from "react";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import ProcessStepCard from "components/Integrations/ProcessStepCard";
import SeerStatusCard, { SeerEligibilityStatus } from "./SeerStatusCard";
import type { Integration } from "types/integrations";
import ExternalLink from "components/ExternalLink";

interface SeerCreditsProps {
  integration: Integration;
}

export default function SeerCredits({ integration }: SeerCreditsProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Hardcoded status for UI demo - will be replaced with actual logic later
  const [eligibilityStatus] = useState<SeerEligibilityStatus>("disconnected");

  const slidesCompleted = currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);

  const handleActionClick = () => {
    switch (eligibilityStatus) {
      case "eligible":
        // Navigate to Seer platform
        window.open("https://seer.pm", "_blank");
        break;
      case "not-eligible":
        // Navigate to registration page
        window.location.href = "/claim";
        break;
      case "disconnected":
        // Connect wallet - placeholder for now
        console.log("Connect wallet clicked");
        break;
    }
  };

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
                previousStep={currentSlideIndex > 0}
                nextStep={currentSlideIndex < integration.firstInfoSlide.length - 1}
                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                onNext={() => {
                  if (currentSlideIndex < integration.firstInfoSlide.length - 1) {
                    setCurrentSlideIndex(currentSlideIndex + 1);
                  } else {
                    setCurrentSlideIndex(integration.firstInfoSlide.length);
                  }
                }}
              />
            </>
          ) : (
            <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
              <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">
                {/* Left Content Area */}
                <div className="flex-1 p-6 lg:p-8">
                  <h2 className="text-primaryText text-xl md:text-2xl font-semibold mb-4">
                    Claim and use your Seer Credits
                  </h2>
                  <div className="mb-4">
                    <p className="text-secondaryText text-sm mb-2">
                      To qualify, you must be an Included profile.
                    </p>
                  </div>
                  
                  {/* Main Description */}
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

                {/* Right Status Card */}
                <SeerStatusCard
                  status={eligibilityStatus}
                  onActionClick={handleActionClick}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

