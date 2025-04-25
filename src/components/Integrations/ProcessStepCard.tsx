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
              style={{
                opacity: previousStep ? "100%" : "50%",
                pointerEvents: previousStep ? "auto" : "none",
                cursor: previousStep ? "pointer" : "not-allowed",
              }}
              onClick={onPrevious}
            />
            <RightArrowIcon
              width={32}
              height={32}
              style={{
                opacity: nextStep ? "100%" : "50%",
                pointerEvents: nextStep ? "auto" : "none",
                cursor: nextStep ? "pointer" : "not-allowed",
              }}
              onClick={onNext}
            />
        </div>
      </div>
    </div>
  );
};

export default ProcessStepCard; 