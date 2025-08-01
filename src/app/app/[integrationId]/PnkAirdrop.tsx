"use client";
import KlerosInfoCard from "components/Integrations/Airdrop/KlerosInfoCard";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import { useState } from "react";
import { Integration } from "types/integrations";


interface AirdropIntegrationProps {
    integration: Integration;
  }

export default function PnkAirdrop({ integration }: AirdropIntegrationProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    return (
        <div className="flex flex-col paper w-full md:w-10/12">
            <IntegrationHeader integration={integration} />
            <div className="flex flex-col paper justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
                <div className="text-orange text-center text-md">Learn more about Kleros to unlock the airdrop</div>
                <KlerosInfoCard 
                    slide={integration.firstInfoSlide![currentSlideIndex]}
                    previousStep={currentSlideIndex > 0}
                    nextStep={currentSlideIndex < integration!.firstInfoSlide!.length - 1}
                    onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                    onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                />
            </div>
        </div>
    )
}