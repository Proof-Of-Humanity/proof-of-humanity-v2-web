"use client";
import KlerosInfoCard from "components/Integrations/Airdrop/KlerosInfoCard";
import PnkAirdropClaim from "components/Integrations/Airdrop/PnkAirdropClaim";
import NotificationCard, { EmailVerificationStatus } from "components/Integrations/Airdrop/NotificationCard";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import { useState } from "react";
import { Integration } from "types/integrations";

interface AirdropIntegrationProps {
    integration: Integration;
}

type EligibilityStatus = 'disconnected' | 'eligible' | 'not-eligible' | 'claimed';

export default function PnkAirdrop({ integration }: AirdropIntegrationProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [showNotificationCard, setShowNotificationCard] = useState(false);
    

    const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>('disconnected');
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus>('pending');
    const [subscribedEmail, setSubscribedEmail] = useState<string>('');
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    
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
    
    const handleSubscribe = async (email: string) => {
    };
    
    const handleResendEmail = async () => {
        console.log('Resending verification email to:', subscribedEmail);
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
                     {1 ? (
                <div className="w-full mb-6 max-w-[1095px]">
                    <NotificationCard
                        onSubscribe={handleSubscribe}
                        onResendEmail={handleResendEmail}
                        isLoading={isEmailLoading}
                        verificationStatus={emailVerificationStatus}
                        subscribedEmail={subscribedEmail}
                    />
                </div>
            ) : null}
                </div>
                {/* Notification Card - shown after claiming */}
            </div>
        </div>
    );
}