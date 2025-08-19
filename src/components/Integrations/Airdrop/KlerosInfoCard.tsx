"use client";
import React from "react";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";

export type KlerosInfoCardProps = {
  slide: InfoSlide;
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const KlerosInfoCard: React.FC<KlerosInfoCardProps> = ({
  slide,
  previousStep,
  nextStep,
  onPrevious,
  onNext,
}) => {

  return (
    <div className="flex flex-col border rounded-[30px] shadow w-full max-w-[1095px] h-auto lg:h-[1035px] mx-auto">
      {/* Image Container - Responsive with fixed aspect ratio */}
      <div className="flex justify-center w-full overflow-hidden rounded-t-[30px]">
        <div className="w-full lg:w-[900px] h-full px-4 sm:px-8 lg:px-0 mt-6 mb-2 lg:mt-12">
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              width={900}
              height={521}
              className="h-auto max-h-[200px] sm:max-h-[300px] my-4 sm:my-6 md:h-auto md:max-h-[521px] md:my-8 rounded-xl border-stroke border shadow"
            />
          )}
        </div>
      </div>
      
      {/* Content Container - Responsive with flexible height */}
      <div className="flex flex-col flex-1 bg-primaryBackground rounded-[30px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {/* Title */}
        <h2 className="text-primaryText text-xl sm:text-2xl font-semibold leading-[1.36] mb-3 lg:mb-4">
          {slide.title}
        </h2>
        
        {/* Description */}
        <div className="text-primaryText text-sm sm:text-base leading-[1.36] whitespace-pre-line mb-2">
          {addLinkToText(slide.description)}
        </div>
        
        {/* Bullet Points */}
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <div className="mb-4 lg:mb-6 mt-4">
            <FeatureList
              items={slide.bulletPoints.map((point): FeatureItem => ({
                text: point,
                iconType: 'check'
              }))}
              spacing="compact"
              iconWidth={16}
              iconHeight={16}
              iconClassName="flex-shrink-0 fill-purple"
              textClassName="text-purple text-sm sm:text-base leading-[1.36] whitespace-pre-line"
              className=""
            />
          </div>
        )}
        
        {/* Navigation Arrows - Responsive positioning */}
        <div className="flex items-center gap-3 lg:gap-4 mt-auto">
          <LeftArrowIcon
            width={32}
            height={32}
            className={`${previousStep ? 'opacity-100 cursor-pointer' : 'opacity-[0.12] cursor-not-allowed pointer-events-none'}`}
            onClick={onPrevious}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => previousStep && e.key === 'Enter' && onPrevious()}
            aria-label="Previous step"
            role="button"
            tabIndex={previousStep ? 0 : -1}
          />
          <RightArrowIcon
            width={32}
            height={32}
            className={`${nextStep ? 'opacity-100 cursor-pointer' : 'opacity-[0.12] cursor-not-allowed pointer-events-none'}`}
            onClick={onNext}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => nextStep && e.key === 'Enter' && onNext()}
            aria-label="Next step"
            role="button"
            tabIndex={nextStep ? 0 : -1}
          />
        </div>
      </div>
    </div>
  );
};

export default KlerosInfoCard; 