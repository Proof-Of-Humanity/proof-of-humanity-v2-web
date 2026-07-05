"use client";
import { useState, useCallback, useMemo } from "react";
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

type SeerUserData = {
  hasValidRegistration: boolean;
  humanityId: string | null;
  chainId: SupportedChainId | undefined;
};

export default function SeerCredits({ integration }: SeerCreditsProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const modal = useAppKit();

  const slidesCompleted =
    currentSlideIndex >= (integration.firstInfoSlide?.length ?? 0);
  const currentSlide = integration.firstInfoSlide?.[currentSlideIndex];

  // Query to check if user has an included profile (checking registrations and cross-chain registrations)
  const { data: userData, isLoading } = useQuery<SeerUserData | null>({
    queryKey: ["seerEligibility", address, chainId],
    queryFn: async (): Promise<SeerUserData | null> => {
      if (!address) return null;

      const normalizedAddress = address.toLowerCase() as Address;
      const now = Math.ceil(Date.now() / 1000);

      const results = await Promise.all(
        supportedChains.map(async (chain) => {
          try {
            const data = await sdk[
              chain.id as SupportedChainId
            ].HumanityIdByClaimer({
              address: normalizedAddress,
              now,
            });

            const localRegistration = data?.registrations?.[0];
            if (localRegistration?.humanity?.id) {
              return {
                hasValidRegistration: true,
                humanityId: localRegistration.humanity.id,
                chainId: chain.id,
              };
            }

            const crossChainRegistration = data?.crossChainRegistrations?.[0];
            if (crossChainRegistration?.id) {
              return {
                hasValidRegistration: true,
                humanityId: crossChainRegistration.id,
                chainId: chain.id,
              };
            }

            return {
              hasValidRegistration: false,
              humanityId: null,
              chainId: chain.id,
            };
          } catch (error) {
            console.error(`Error checking chain ${chain.id}:`, error);
            return {
              hasValidRegistration: false,
              humanityId: null,
              chainId: chain.id,
            };
          }
        }),
      );

      return (
        results.find((r) => r.hasValidRegistration) || {
          hasValidRegistration: false,
          humanityId: null,
          chainId: undefined,
        }
      );
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
        window.open("https://app.seer.pm/", "_blank", "noopener,noreferrer");
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
    <div className="flex w-full max-w-[1200px] flex-col space-y-8 md:w-10/12">
      <div className="flex flex-col gap-3">
        <IntegrationHeader {...{ integration }} />
        {!slidesCompleted && integration.firstInfoSlide && currentSlide ? (
          <div className="paper flex flex-col items-center justify-center space-y-4 px-4 py-2 md:px-8 md:py-4">
            <ExternalLink
              href="https://seer.pm/"
              className="text-orange text-md my-4 text-center"
            >
              Learn more about Seer to get started
            </ExternalLink>
            <ProcessStepCard
              allSlides={integration.firstInfoSlide}
              currentIndex={currentSlideIndex}
              onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
              onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              onLastSlideComplete={() =>
                setCurrentSlideIndex(currentSlideIndex + 1)
              }
            />
          </div>
        ) : (
          <div className="relative w-full">
            <div className="border-stroke bg-whiteBackground relative flex flex-col rounded-[30px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex-row lg:items-stretch">
              <div className="flex-1 p-6 lg:p-8">
                <h2 className="text-primaryText mb-4 text-xl font-semibold md:text-2xl">
                  Claim and use your Seer Credits
                </h2>
                <div className="mb-4">
                  <p className="text-status-registered mb-2 text-sm">
                    To qualify, you must be a Verified Human profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-orange text-base font-semibold md:text-lg">
                    Get $10 of Seer Credits when you register, with potential
                    bonus credits after.
                  </p>

                  <div className="text-secondaryText space-y-3 text-sm leading-relaxed">
                    <p>
                      Seer Credits are rewards for registered Proof of Humanity
                      users to use on the Seer Prediction Market platform.
                    </p>

                    <p>
                      Use your starting credits to take positions in prediction
                      markets. Bonus credits may be added later, and unused
                      credits can expire.
                    </p>
                  </div>
                </div>
              </div>

              <SeerStatusCard
                status={eligibilityStatus}
                onActionClick={handleActionClick}
                isLoading={isLoading && isConnected}
                address={address}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
