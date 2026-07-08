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
    <div className="flex flex-col rounded-[30px] border">
      <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-t-[30px]">
        <Image
          src={step.image || ""}
          alt={step.title}
          width={900}
          height={521}
          className="border-stroke mx-4 my-4 h-auto max-h-[200px] rounded-md border object-contain sm:mx-0 sm:my-6 sm:max-h-[300px] md:mb-2 md:mt-8 md:h-auto md:max-h-[521px]"
        />
        <p className="text-secondaryText mb-4 px-4 text-sm sm:text-base md:px-6">
          If you're on desktop,
          <a
            href="https://app.gnosis.io/transfer/0x9a450CF5AAFa348A3d4857CbDD49e23819F08A0e/crc?data=0xf3f5858942140fd2894eeb8b74cd0ed72d24fc6675d352a2884b1be2f32256fe"
            className="text-orange hover:text-orange/80 font-medium hover:cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            click here{" "}
          </a>
          to mint our group $CRC
        </p>
      </div>
      <div className="bg-primaryBackground flex flex-1 flex-col rounded-[30px] p-4 md:p-6">
        <p className="text-primaryText text-xl font-semibold md:text-2xl">
          {step.title}
        </p>
        <p className="text-primaryText mt-4 flex-1 text-sm leading-relaxed md:text-base">
          {addLinkToText(step.description)}
        </p>
        <br />
        <p className="text-orange mb-4 text-base">
          We have benefits incoming for the largest holders of our group $CRC,
          soon!
        </p>
        {(previousStep || nextStep) && (
          <div className="mt-4 flex space-x-2 md:mt-6 md:space-x-4">
            <LeftArrowIcon
              width={32}
              height={32}
              className={`${previousStep ? "cursor-pointer opacity-100" : "pointer-events-none cursor-not-allowed opacity-50"}`}
              onClick={onPrevious}
              onKeyDown={(e: React.KeyboardEvent<SVGElement>) =>
                previousStep && e.key === "Enter" && onPrevious()
              }
              aria-label="Previous step"
              role="button"
              tabIndex={previousStep ? 0 : -1}
            />
            <RightArrowIcon
              width={32}
              height={32}
              className={`ml-2 ${nextStep ? "cursor-pointer opacity-100" : "pointer-events-none cursor-not-allowed opacity-50"}`}
              onClick={onNext}
              onKeyDown={(e: React.KeyboardEvent<SVGElement>) =>
                nextStep && e.key === "Enter" && onNext()
              }
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
