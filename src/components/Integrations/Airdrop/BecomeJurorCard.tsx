"use client";
import React from "react";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";

export type BecomeJurorCardProps = {
  slide: InfoSlide;
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

const BecomeJurorCard: React.FC<BecomeJurorCardProps> = ({
  slide,
  previousStep,
  nextStep,
  onPrevious,
  onNext,
  className = "",
}) => {
  const descriptionLines = slide.description.split("\n\n");
  const mainDescription = descriptionLines[0] || "";
  const greenHighlight =
    "Anyone can be a juror! Whether you're a pilot, a teacher or a homemaker. No legal degree needed.";
  const stakingInfo = descriptionLines[1] || "";

  const voteResultsRaw = descriptionLines.slice(2).join("\n\n");
  const voteResults = voteResultsRaw
    .split(/(?=✅)|(?=❌)/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());

  const textBase = "text-sm sm:text-base leading-[1.36]";
  const textSection = `${textBase} mb-3`;

  const ArrowButton = ({ Icon, enabled, onClick, label }: any) => (
    <Icon
      width={32}
      height={32}
      className={
        enabled
          ? "cursor-pointer opacity-100"
          : "pointer-events-none cursor-not-allowed opacity-[0.12]"
      }
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) =>
        enabled && e.key === "Enter" && onClick()
      }
      aria-label={label}
      role="button"
      tabIndex={enabled ? 0 : -1}
    />
  );

  return (
    <div
      className={`mx-auto flex h-auto w-full max-w-[1095px] flex-col rounded-[30px] border shadow lg:h-[1035px] ${className}`}
    >
      {/* Image */}
      <div className="flex w-full justify-center overflow-hidden rounded-t-[30px]">
        <div className="mb-2 mt-6 w-full px-4 sm:px-8 lg:mt-12 lg:w-[900px] lg:px-0">
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              width={900}
              height={521}
              className="my-4 h-auto max-h-[200px] rounded-xl border shadow sm:my-6 sm:max-h-[300px] md:my-8 md:h-auto md:max-h-[521px]"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-primaryBackground flex flex-1 flex-col rounded-[30px] p-4 sm:p-6 lg:p-8">
        <h2 className="text-primaryText mb-3 text-xl font-semibold leading-[1.36] sm:text-2xl lg:mb-4">
          {slide.title}
        </h2>

        {/* Top bullet */}
        {slide.bulletPoints?.[0] && (
          <div className="mb-4 flex items-start gap-2">
            <FeatureList
              items={slide.bulletPoints.slice(0, 1).map(
                (point): FeatureItem => ({
                  text: point,
                  iconType: "check",
                }),
              )}
              spacing="compact"
              iconWidth={16}
              iconHeight={16}
              iconClassName="flex-shrink-0 fill-purple"
              textClassName="text-purple text-sm sm:text-base leading-[1.36] whitespace-pre-line"
            />
          </div>
        )}

        <div className={`text-primaryText ${textSection}`}>
          {addLinkToText(mainDescription)}
        </div>

        <div className={`text-green-600 ${textSection}`}>{greenHighlight}</div>

        <div className={`text-primaryText ${textSection}`}>{stakingInfo}</div>

        {/* Vote results */}
        {voteResults.length > 0 && (
          <div className="mb-4 space-y-1">
            {voteResults.map((result, index) => (
              <div key={index} className={`text-primaryText ${textBase}`}>
                {result}
              </div>
            ))}
          </div>
        )}

        {/* Bottom links */}
        {slide.bulletPoints?.[1] && (
          <div className={`text-orange ${textBase} mb-4`}>
            {addLinkToText(slide.bulletPoints[1])}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-auto flex gap-3 lg:gap-4">
          <ArrowButton
            Icon={LeftArrowIcon}
            enabled={previousStep}
            onClick={onPrevious}
            label="Previous step"
          />
          <ArrowButton
            Icon={RightArrowIcon}
            enabled={nextStep}
            onClick={onNext}
            label="Next step"
          />
        </div>
      </div>
    </div>
  );
};

export default BecomeJurorCard;
