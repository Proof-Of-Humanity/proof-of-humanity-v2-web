"use client";
import React from "react";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";

export type ProcessStepCardProps = {
  step: InfoSlide;
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const CirclesStepCard: React.FC<ProcessStepCardProps> = ({
  step,
  previousStep,
  nextStep,
  onPrevious,
  onNext,
}) => {

  return (
    <div className="flex flex-col border rounded-[30px] shadow">
      <div className="flex flex-col justify-center items-center w-full overflow-hidden rounded-t-[30px]">
        <Image
          src={step.image || ''}
          alt={step.title}
          width={900}
          height={521}
          className="h-auto object-contain max-h-[200px] sm:max-h-[300px] my-4 sm:my-6 md:h-auto md:max-h-[521px] md:mt-8 md:mb-2 rounded-md border-stroke border shadow"
        />
        <p className="text-secondaryText text-base mb-4">
          If you're on desktop, 
            <a href="https://app.metri.xyz/transfer/0x9a450CF5AAFa348A3d4857CbDD49e23819F08A0e/crc" className="text-orange font-medium hover:text-orange/80 hover:cursor-pointer" target="_blank" rel="noopener noreferrer"> click here </a>
            to mint our group $CRC
        </p>
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-1 bg-primaryBackground rounded-[30px]">
        <p className="text-primaryText text-xl md:text-2xl font-semibold">{step.title}</p>
        <p className="text-primaryText mt-4 flex-1 text-sm md:text-base">{addLinkToText(step.description)}</p>
        <br/>
        <p className="text-orange text-base mb-4">We have benefits incoming for the largest holders of our group $CRC, soon!</p>
        {(previousStep || nextStep) && (
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

export default CirclesStepCard; 