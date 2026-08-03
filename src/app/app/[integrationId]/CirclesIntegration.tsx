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
    // State
    walletAddress,
    linkStatus,
    isCirclesDataQueryError,
    pending,
    isLoadingCirclesData,

    // Actions
    setWalletAddress,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps,
  } = useCirclesIntegration();

  return (
    <div className="paper flex w-full flex-col md:w-10/12">
      <IntegrationHeader integration={integration} />

      <div className="paper flex flex-col items-center justify-center space-y-4 px-4 py-2 md:px-8 md:py-4">
        <CirclesCreateAccountStep
          steps={integration.firstInfoSlide || []}
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
    </div>
  );
}
