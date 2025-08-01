"use client";
import React, { useState } from "react";
import { Integration } from "types/integrations";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";

import IntegrationHeader from "components/Integrations/IntegrationHeader";
import CirclesCreateAccountStep from "components/Integrations/Circles/CirclesCreateAccountStep";
import CirclesLinkAccountStep from "components/Integrations/Circles/CirclesLinkAccountStep";
import CirclesMintTokensStep from "components/Integrations/Circles/CirclesMintTokensStep";
import useCirclesIntegration from "hooks/useCirclesIntegration";

enableReactUse();

interface CirclesIntegrationProps {
  integration: Integration;
}

export default React.memo(function CirclesIntegration({ integration }: CirclesIntegrationProps) {
  const [openAccordionKey, setOpenAccordionKey] = useState<string | null>(null);

  const handleToggleAccordion = (key: string) => {
    setOpenAccordionKey(openAccordionKey === key ? null : key);
  };

  const {
    // State
    walletAddress,
    linkStatus,
    isCirclesDataQueryError,
    currentCreateAccountStep,
    currentMintStep,
    pending,
    isLoadingCirclesData,
    
    // Actions
    setWalletAddress,
    setCurrentCreateAccountStep,
    setCurrentMintStep,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps
  } = useCirclesIntegration();

  return (
    <div className="flex flex-col paper w-full md:w-10/12">
      <IntegrationHeader integration={integration} />
      
      <div className="flex flex-col paper justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
        <CirclesCreateAccountStep 
          steps={integration.firstInfoSlide || []}
          currentStep={currentCreateAccountStep}
          setCurrentStep={setCurrentCreateAccountStep}
          isOpen={openAccordionKey === 'createAccount'}
          onToggle={() => handleToggleAccordion('createAccount')}
        />
        
        <CirclesLinkAccountStep 
          linkStatus={linkStatus}
          walletAddress={walletAddress}
          onAddressChange={(e) => setWalletAddress(e.target.value)}
          onLinkAccount={handleLinkAccount}
          onRenewTrust={handleRenewTrust}
          isLoading={isLoadingCirclesData}
          isError={isCirclesDataQueryError}
          getActionButtonProps={getActionButtonProps}
          pending={pending}
          isOpen={openAccordionKey === 'linkAccount'}
          onToggle={() => handleToggleAccordion('linkAccount')}
        />
        
        <CirclesMintTokensStep 
          steps={integration.secondInfoSlide || []}
          currentStep={currentMintStep}
          setCurrentStep={setCurrentMintStep}
          isOpen={openAccordionKey === 'mintTokens'}
          onToggle={() => handleToggleAccordion('mintTokens')}
        />
      </div>
    </div>
  );
});