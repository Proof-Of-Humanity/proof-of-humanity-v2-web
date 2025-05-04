"use client";
import React from "react";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { ConnectionStep } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";


export type ProcessStepCardProps = {
  step: ConnectionStep;
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
    <div className="flex flex-col border rounded-[30px] shadow">
      <div className="flex justify-center w-full overflow-hidden rounded-t-[30px]">
        <Image
          src={step.image || ''}
          alt={step.title}
          width={900}
          height={521}
          className="my-8 rounded-md border-stroke border shadow"
        />
      </div>
      <div className="p-6 flex flex-col flex-1 bg-primaryBackground rounded-b-[30px]">
        <p className="text-primaryText text-2xl font-semibold">{step.title}</p>
        <p className="text-primaryText mt-4 flex-1">{addLinkToText(step.description)}</p>
        <div className="flex mt-6 space-x-4">
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
      </div>
    </div>
  );
};

export default ProcessStepCard; 