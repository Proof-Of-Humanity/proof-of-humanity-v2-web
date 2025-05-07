"use client";
import React from "react";
import { Integration } from "types/integrations";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";

// Import custom components
import IntegrationHeader from "components/Integrations/Circles/IntegrationHeader";
import CirclesCreateAccountStep from "components/Integrations/Circles/CirclesCreateAccountStep";
import CirclesLinkAccountStep from "components/Integrations/Circles/CirclesLinkAccountStep";
import CirclesMintTokensStep from "components/Integrations/Circles/CirclesMintTokensStep";
import useCirclesIntegration from "hooks/useCirclesIntegration";

enableReactUse();

interface CirclesIntegrationProps {
  integration: Integration;
}

export default React.memo(function CirclesIntegration({ integration }: CirclesIntegrationProps) {
  const {
    // State
    walletAddress,
    linkStatus,
    fetchError,
    disableButton,
    currentCreateAccountStep,
    currentMintStep,
    isWalletAddressValid,
    pending,
    isFetching,
    
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
          steps={integration.connectionSteps || []}
          currentStep={currentCreateAccountStep}
          setCurrentStep={setCurrentCreateAccountStep}
        />
        
        <CirclesLinkAccountStep 
          linkStatus={linkStatus}
          walletAddress={walletAddress}
          onAddressChange={(e) => setWalletAddress(e.target.value)}
          onLinkAccount={handleLinkAccount}
          onRenewTrust={handleRenewTrust}
          isLoading={isFetching}
          error={fetchError}
          isWalletAddressValid={isWalletAddressValid}
          disableButton={disableButton}
          getActionButtonProps={getActionButtonProps}
          pending={pending}
        />
        
        <CirclesMintTokensStep 
          steps={integration.mintSteps || []}
          currentStep={currentMintStep}
          setCurrentStep={setCurrentMintStep}
        />
      </div>
    </div>
  );
});