"use client";
import React from "react";
import Image from "next/image";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";

export type BecomeJurorCardProps = {
  slide: InfoSlide;
  className?: string;
};

const BecomeJurorCard: React.FC<BecomeJurorCardProps> = ({
  slide,
  className = "",
}) => {
  const descriptionLines = slide.description.split("\n\n");
  const mainDescription = descriptionLines[0] || "";
  const greenHighlight =
    "Anyone can be a juror! Whether you're a pilot, a teacher or a homemaker. No legal degree needed.";
  const jurorSummary =
    "⚖️ Fair rulings are rewarded & the system keeps jurors honest.";
  const stakingInfo = descriptionLines[1] || "";

  // First bullet is the Stake > Judge > Earn > Repeat flow; it sits under the title.
  const [stepFlow, ...bottomBullets] = (slide.bulletPoints ?? []).filter(
    Boolean,
  );

  const bulletStyle = {
    spacing: "compact",
    iconWidth: 16,
    iconHeight: 16,
    iconClassName: "flex-shrink-0 text-status-registered",
    textClassName:
      "text-status-registered text-sm sm:text-base leading-[1.36] whitespace-pre-line",
  } as const;

  const voteResultsRaw = descriptionLines.slice(2).join("\n\n");
  const voteResults = voteResultsRaw
    .split(/(?=✅)|(?=❌)/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());

  const textBase = "text-sm sm:text-base leading-[1.36]";
  const textSection = `${textBase} mb-3`;

  return (
    <div className={`mx-auto flex w-full max-w-[1095px] flex-col ${className}`}>
      {slide.image && (
        <div className="mt-4 flex w-full justify-center px-2 sm:px-6 lg:mt-6">
          <Image
            src={slide.image}
            alt={slide.title}
            width={900}
            height={521}
            className="h-auto w-full max-w-[900px] rounded-2xl"
          />
        </div>
      )}

      <div className="border-stroke mx-2 mt-6 border-t sm:mx-6 lg:mt-8" />

      <div className="flex flex-1 flex-col px-2 pt-5 sm:px-6 lg:pt-6">
        <h2 className="text-primaryText mb-3 text-xl font-semibold leading-[1.36] sm:text-2xl lg:mb-4">
          {slide.title}
        </h2>

        {stepFlow && (
          <FeatureList
            items={[{ text: stepFlow, iconType: "check" }]}
            className="mb-3 lg:mb-4"
            {...bulletStyle}
          />
        )}

        <div className={`text-primaryText ${textSection}`}>
          {addLinkToText(mainDescription)}
        </div>

        <div className={`text-green-600 ${textSection}`}>{greenHighlight}</div>

        <div className={`text-primaryText ${textSection}`}>{stakingInfo}</div>

        {voteResults.length > 0 && (
          <div className="mb-4 space-y-1">
            {voteResults.map((result, index) => (
              <div key={index} className={`text-primaryText ${textBase}`}>
                {result}
              </div>
            ))}
          </div>
        )}

        <div className={`text-secondaryText ${textSection}`}>
          {jurorSummary}
        </div>

        {bottomBullets.length > 0 && (
          <FeatureList
            items={bottomBullets.map(
              (point): FeatureItem => ({
                text: point,
                iconType: "check",
              }),
            )}
            className="mb-4"
            {...bulletStyle}
          />
        )}
      </div>
    </div>
  );
};

export default BecomeJurorCard;
