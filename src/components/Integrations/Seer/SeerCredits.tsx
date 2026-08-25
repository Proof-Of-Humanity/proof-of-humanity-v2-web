"use client";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import StepCarousel from "components/Integrations/StepCarousel";
import FeatureList, { type FeatureItem } from "components/FeatureList";
import { addLinkToText } from "components/addLinkToText";
import SeerStatusCard, { SeerEligibilityStatus } from "./SeerStatusCard";
import type { Integration, InfoSlide } from "types/integrations";
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

  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useQuery<SeerUserData | null>({
    queryKey: ["seerEligibility", address, chainId],
    queryFn: async (): Promise<SeerUserData | null> => {
      if (!address) return null;

      const normalizedAddress = address.toLowerCase() as Address;
      const now = Math.ceil(Date.now() / 1000);

      const results = await Promise.allSettled(
        supportedChains.map(async (chain): Promise<SeerUserData> => {
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
        }),
      );

      const valid = results.find(
        (r): r is PromiseFulfilledResult<SeerUserData> =>
          r.status === "fulfilled" && r.value.hasValidRegistration,
      );
      if (valid) return valid.value;

      const failed = results.find((r) => r.status === "rejected");
      if (failed) {
        console.error("Seer eligibility check failed:", failed.reason);
        throw new Error("Unable to determine Seer eligibility");
      }

      return {
        hasValidRegistration: false,
        humanityId: null,
        chainId: undefined,
      };
    },
    enabled: isConnected && !!address,
  });

  const eligibilityStatus: SeerEligibilityStatus = useMemo(() => {
    if (!isConnected) return "disconnected";
    if (isError) return "error";
    if (userData?.hasValidRegistration) {
      return "eligible";
    }
    return "not-eligible";
  }, [isConnected, isError, userData]);

  const handleActionClick = useCallback(() => {
    if (isLoading) return;
    switch (eligibilityStatus) {
      case "eligible":
        window.open("https://app.seer.pm/", "_blank", "noopener,noreferrer");
        break;
      case "not-eligible":
        if (address) {
          const url = `/${prettifyId(address)}/claim`;
          const opened = window.open(url, "_blank");
          if (opened) opened.opener = null;
          else window.location.assign(url);
        }
        break;
      case "error":
        void refetch();
        break;
      case "disconnected":
        modal.open({ view: "Connect" });
        break;
    }
  }, [eligibilityStatus, isLoading, modal, address, refetch]);

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
            <StepCarousel
              slides={integration.firstInfoSlide}
              currentIndex={currentSlideIndex}
              onPrevious={() => setCurrentSlideIndex(currentSlideIndex - 1)}
              onNext={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              onLastSlideComplete={() =>
                setCurrentSlideIndex(currentSlideIndex + 1)
              }
            >
              {({ slide, index }) => (
                <SeerSlide
                  slide={slide}
                  isLast={index === integration.firstInfoSlide!.length - 1}
                  isFirst={index === 0}
                />
              )}
            </StepCarousel>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="border-stroke bg-whiteBackground relative flex flex-col rounded-[30px] border dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex-row lg:items-stretch">
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
                    Get $5 of Seer Credits when you register, with potential
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

// Very wide (>2.2) or tall/square (<1.4) images letterbox instead of cropping
const getObjectFitClass = (slide: InfoSlide, isLast: boolean) => {
  if (slide.imageWidth && slide.imageHeight) {
    const ratio = slide.imageWidth / slide.imageHeight;
    if (ratio > 2.2 || ratio < 1.4) {
      return "object-contain";
    }
  }
  return isLast ? "object-contain" : "object-cover";
};

function SeerSlide({
  slide,
  isFirst,
  isLast,
}: {
  slide: InfoSlide;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <>
      {slide.image && (
        <div className="mt-4 flex w-full justify-center px-2 sm:px-6 lg:mt-6">
          <div className="relative aspect-video w-full max-w-[900px]">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
              className={`rounded-2xl ${getObjectFitClass(slide, isLast)}`}
              priority={isFirst}
            />
          </div>
        </div>
      )}

      <div className="border-stroke mx-2 mt-6 border-t sm:mx-6 lg:mt-8" />

      <div className="flex flex-1 flex-col px-2 pt-5 sm:px-6 lg:pt-6">
        <p className="text-primaryText text-xl font-semibold md:text-2xl">
          {slide.title}
        </p>
        <div className="text-secondaryText mt-4 text-sm leading-relaxed md:text-base">
          {addLinkToText(slide.description)}
        </div>
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <FeatureList
            items={slide.bulletPoints.map(
              (point): FeatureItem => ({
                text: point,
                iconType: "check",
              }),
            )}
            className="mt-4"
            iconWidth={16}
            iconHeight={16}
            iconClassName="flex-shrink-0 text-status-registered"
            textClassName="text-status-registered text-sm md:text-base"
          />
        )}
      </div>
    </>
  );
}
