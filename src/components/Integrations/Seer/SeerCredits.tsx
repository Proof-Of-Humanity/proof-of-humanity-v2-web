"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import IntegrationHeader from "components/Integrations/IntegrationHeader";
import StepCarousel from "components/Integrations/StepCarousel";
import FeatureList from "components/FeatureList";
import { addLinkToText } from "components/addLinkToText";
import SeerStatusCard, { SeerEligibilityStatus } from "./SeerStatusCard";
import type { Integration, InfoSlide } from "types/integrations";
import ExternalLink from "components/ExternalLink";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { prettifyId } from "utils/identifier";
import { sdk } from "config/subgraph";
import { Address } from "viem";
import { supportedChains, SupportedChainId } from "config/chains";

interface SeerCreditsProps {
  integration: Integration;
}

export default function SeerCredits({ integration }: SeerCreditsProps) {
  const [slidesCompleted, setSlidesCompleted] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const modal = useAppKit();

  const slides = integration.firstInfoSlide ?? [];

  // Eligible when the address has a registration (local or cross-chain) on any supported chain.
  const {
    data: isRegistered,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seerEligibility", address],
    queryFn: async () => {
      if (!address) return false;
      const normalizedAddress = address.toLowerCase() as Address;
      const now = Math.ceil(Date.now() / 1000);
      const results = await Promise.all(
        supportedChains.map((chain) =>
          sdk[chain.id as SupportedChainId]
            .HumanityIdByClaimer({ address: normalizedAddress, now })
            .catch((error) => {
              console.error(`Error checking chain ${chain.id}:`, error);
              return null;
            }),
        ),
      );
      const registered = results.some(
        (data) =>
          data?.registrations?.[0]?.humanity?.id ||
          data?.crossChainRegistrations?.[0]?.id,
      );
      // A failed chain may hold the user's registration — never report
      // "not eligible" unless every chain actually answered.
      if (!registered && results.some((data) => data === null))
        throw new Error("Eligibility check failed on at least one chain");
      return registered;
    },
    enabled: isConnected && !!address,
  });

  const eligibilityStatus: SeerEligibilityStatus =
    !isConnected || isLoading
      ? "disconnected"
      : isError
        ? "error"
        : isRegistered
          ? "eligible"
          : "not-eligible";

  const handleActionClick = () => {
    switch (eligibilityStatus) {
      case "eligible":
        window.open("https://app.seer.pm/", "_blank", "noopener,noreferrer");
        break;
      case "not-eligible":
        if (address) router.push(`/${prettifyId(address)}/claim`);
        break;
      case "error":
        void refetch();
        break;
      case "disconnected":
        modal.open({ view: "Connect" });
        break;
    }
  };

  return (
    <div className="flex w-full flex-col space-y-8 md:w-10/12">
      <div className="paper">
        <IntegrationHeader {...{ integration }} />
        <div className="flex flex-col items-center justify-center space-y-4 px-4 py-2 md:px-8 md:py-4">
          {!slidesCompleted && slides.length > 0 ? (
            <>
              <ExternalLink
                href="https://seer.pm/"
                className="text-purple text-md my-4 text-center"
              >
                Learn more about Seer to get started
              </ExternalLink>
              <StepCarousel
                slides={slides}
                onComplete={() => setSlidesCompleted(true)}
                arrowClasses={{
                  icon: "transition-all duration-200",
                  enabled: "hover:scale-110",
                }}
              >
                {({ slide, index, arrows }) => (
                  <SeerSlide
                    {...{ slide, arrows }}
                    isFirst={index === 0}
                    isLast={index === slides.length - 1}
                  />
                )}
              </StepCarousel>
            </>
          ) : (
            <div className="mx-auto w-full max-w-[1095px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF] p-[1px]">
              <div className="bg-primaryBackground flex flex-col rounded-[29px] lg:flex-row">
                <div className="flex-1 p-6 lg:p-8">
                  <h2 className="text-primaryText mb-4 text-xl font-semibold md:text-2xl">
                    Claim and use your Seer Credits
                  </h2>
                  <div className="mb-4">
                    <p className="text-secondaryText mb-2 text-sm">
                      To qualify, you must be an Included profile.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-purple text-base font-semibold md:text-lg">
                      Get $10 of Seer Credits when you register, with potential
                      bonus credits after.
                    </p>

                    <div className="text-secondaryText space-y-3 text-sm leading-relaxed">
                      <p>
                        Seer Credits are rewards for registered Proof of
                        Humanity users to use on the Seer Prediction Market
                        platform.
                      </p>

                      <p>
                        Use your starting credits to take positions in
                        prediction markets. Bonus credits may be added later,
                        and unused credits can expire.
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
    </div>
  );
}

function SeerSlide({
  slide,
  isFirst,
  isLast,
  arrows,
}: {
  slide: InfoSlide;
  isFirst: boolean;
  isLast: boolean;
  arrows: React.ReactNode;
}) {
  // 16:9 is ~1.77. Wide (>2.2) or tall/square (<1.4) images get cropped badly
  // by object-cover; the last slide always uses contain (legacy behavior).
  const ratio =
    slide.imageWidth && slide.imageHeight
      ? slide.imageWidth / slide.imageHeight
      : null;
  const objectFit =
    (ratio !== null && (ratio > 2.2 || ratio < 1.4)) || isLast
      ? "object-contain"
      : "object-cover";

  return (
    <div className="border-stroke flex h-full w-full max-w-[1095px] flex-col overflow-hidden rounded-[30px] border shadow">
      <div className="bg-whiteBackground flex w-full items-center justify-center overflow-hidden rounded-t-[30px] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {/* Use a fixed height container that matches the aspect-video height on large screens to maintain consistency */}
        <div className="relative flex aspect-video w-full items-center justify-center">
          <Image
            src={slide.image || ""}
            alt={slide.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
            className={`border-stroke rounded-md border shadow transition-opacity duration-300 ${objectFit}`}
            priority={isFirst}
          />
        </div>
      </div>
      {/* Fixed height container for text content to prevent layout shifts */}
      <div className="bg-primaryBackground flex h-[420px] flex-col rounded-b-[30px] p-4 md:p-6">
        <p className="text-primaryText line-clamp-2 min-h-[56px] text-xl font-semibold md:min-h-[64px] md:text-2xl">
          {slide.title}
        </p>
        <div className="text-primaryText mt-4 flex-1 overflow-y-auto text-sm md:text-base">
          {addLinkToText(slide.description)}
        </div>
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <FeatureList
            items={slide.bulletPoints}
            className="mt-4"
            textClassName="text-primaryText text-sm md:text-base"
          />
        )}
        {arrows}
      </div>
    </div>
  );
}
