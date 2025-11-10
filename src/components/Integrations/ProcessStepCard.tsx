"use client";
import React from "react";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";

export type ProcessStepCardProps = {
  step: InfoSlide;
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  step,
  previousStep,
  nextStep,
  onPrevious,
  onNext,
}) => {

  return (
    <div className="flex h-full flex-col border rounded-[30px] shadow min-w-[1095px]">
      <div className="flex justify-center items-center rounded-t-[30px] min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
        <Image
          src={step.image || ''}
          alt={step.title}
          width={step.imageWidth || 900}
          height={step.imageHeight || 521}
          className="my-4 sm:my-6 md:my-8 rounded-md border-stroke border shadow max-w-full h-auto"
        />
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-1 bg-primaryBackground rounded-[30px]">
        <p className="text-primaryText text-xl md:text-2xl font-semibold">{step.title}</p>
        <p className="text-primaryText mt-4 flex-1 text-sm md:text-base">{addLinkToText(step.description)}</p>
        {step.bulletPoints && step.bulletPoints.length > 0 && (
          <FeatureList 
            items={step.bulletPoints.map((point): FeatureItem => ({
              text: point,
              iconType: 'check'
            }))} 
            className="mt-4"
            textClassName="text-primaryText text-sm md:text-base"
          />
        )}
        <div className="flex mt-4 md:mt-6 space-x-2 md:space-x-4">
          <LeftArrowIcon 
            width={32} 
            height={32} 
            className={`${previousStep ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            onClick={onPrevious}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => previousStep && e.key === 'Enter' && onPrevious()}
            aria-label="Previous step"
            role="button"
            tabIndex={previousStep ? 0 : -1}
          />
          <RightArrowIcon 
            width={32} 
            height={32} 
            className={`ml-2 ${nextStep ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            onClick={onNext}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => nextStep && e.key === 'Enter' && onNext()}
            aria-label="Next step"
            role="button"
            tabIndex={nextStep ? 0 : -1}
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default ProcessStepCard; 