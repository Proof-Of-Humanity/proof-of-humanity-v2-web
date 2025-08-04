"use client";
import KlerosInfoCard from "components/Integrations/Airdrop/KlerosInfoCard";
import PnkAirdropClaim from "components/Integrations/Airdrop/PnkAirdropClaim";
import NotificationCard from "components/Integrations/Airdrop/NotificationCard";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import { useState } from "react";
import { Integration } from "types/integrations";

interface AirdropIntegrationProps {
    integration: Integration;
}

export default function PnkAirdrop({ integration }: AirdropIntegrationProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [showClaim, setShowClaim] = useState(false);
    const [showNotificationCard, setShowNotificationCard] = useState(false);
    
    const [eligibilityStatus, setEligibilityStatus] = useState<'disconnected' | 'eligible' | 'not-eligible' | 'claimed'>('disconnected');
    
    const handleConnectWallet = () => {
        console.log('Connecting wallet...');
        const statuses: Array<'eligible' | 'not-eligible'> = ['eligible', 'not-eligible'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setEligibilityStatus(randomStatus);
    };
    
    const handleClaimAndStake = () => {
        console.log('Claiming and staking PNK...');
        setEligibilityStatus('claimed');
        setShowNotificationCard(true);
    };
    
    const handleSubscribe = (email: string) => {
        console.log('Subscribing email:', email);
    };
    
    const isLastSlide = currentSlideIndex === integration!.firstInfoSlide!.length - 1;
    const slidesCompleted = true;
    
    return (
        <div className="flex flex-col w-full md:w-10/12 space-y-8">
            <div className="paper">
                <IntegrationHeader integration={integration} />
                <div className="flex flex-col justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
                    {!slidesCompleted ? (
                        <>
                            <div className="text-orange text-center text-md">Learn more about Kleros to unlock the airdrop</div>
                            <KlerosInfoCard
                                slide={integration.firstInfoSlide![currentSlideIndex]}
                                previousStep={currentSlideIndex > 0}
                                nextStep={currentSlideIndex <= integration!.firstInfoSlide!.length - 1}
                                onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                                onNext={() => {
                                    if (isLastSlide) {
                                        // Move to claim component by incrementing beyond slides
                                        setCurrentSlideIndex(currentSlideIndex + 1);
                                    } else {
                                        setCurrentSlideIndex(currentSlideIndex + 1);
                                    }
                                }}
                            />
                        </>
                    ) : (
                        <div className="w-full max-w-[1095px]">
                            <PnkAirdropClaim
                                eligibilityStatus={eligibilityStatus}
                                onConnectWallet={handleConnectWallet}
                                onClaimAndStake={handleClaimAndStake}
                            />
                        </div>
                    )}
                </div>
                {/* Notification Card - shown after claiming */}
            {1 && (
                <div className="w-full mb-6">
                    <NotificationCard
                        onSubscribe={handleSubscribe}
                    />
                </div>
            )}
            </div>
        </div>
    );
}