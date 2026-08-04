"use client";
import { useState } from "react";
import { Integration } from "types/integrations";

import IntegrationHeader from "components/Integrations/IntegrationHeader";
import CirclesCreateAccountStep from "components/Integrations/Circles/CirclesCreateAccountStep";
import CirclesLinkAccountStep from "components/Integrations/Circles/CirclesLinkAccountStep";
import CirclesMintTokensStep from "components/Integrations/Circles/CirclesMintTokensStep";
import useCirclesIntegration from "hooks/useCirclesIntegration";

interface CirclesIntegrationProps {
  integration: Integration;
}

export default function CirclesIntegration({
  integration,
}: CirclesIntegrationProps) {
  const [openAccordionKey, setOpenAccordionKey] = useState<string | null>(null);

  const handleToggleAccordion = (key: string) => {
    setOpenAccordionKey(openAccordionKey === key ? null : key);
  };

  const {
    walletAddress,
    linkStatus,
    isCirclesDataQueryError,
    currentCreateAccountStep,
    pending,
    isLoadingCirclesData,

    setWalletAddress,
    setCurrentCreateAccountStep,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps,
  } = useCirclesIntegration();

  return (
    <div className="flex w-full max-w-[1159px] flex-col gap-4 px-4 md:mt-4 md:px-0">
      <IntegrationHeader
        integration={integration}
        className="rounded-[16px] md:min-h-[201px]"
      />

      <CirclesCreateAccountStep
        steps={integration.firstInfoSlide || []}
        currentStep={currentCreateAccountStep}
        setCurrentStep={setCurrentCreateAccountStep}
        onComplete={() => setOpenAccordionKey("linkAccount")}
        isOpen={openAccordionKey === "createAccount"}
        onToggle={() => handleToggleAccordion("createAccount")}
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
        isOpen={openAccordionKey === "linkAccount"}
        onToggle={() => handleToggleAccordion("linkAccount")}
      />

      <CirclesMintTokensStep
        steps={integration.secondInfoSlide || []}
        isOpen={openAccordionKey === "mintTokens"}
        onToggle={() => handleToggleAccordion("mintTokens")}
      />
    </div>
  );
}
