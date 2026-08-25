import React from "react";
import Image from "next/image";
import Accordion from "components/Accordion";
import WizardNav, {
  type WizardNavProps,
} from "components/Integrations/WizardNav";
import { addLinkToText } from "components/addLinkToText";
import { InfoSlide } from "types/integrations";

interface CirclesCreateAccountStepProps {
  steps: InfoSlide[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onComplete: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CirclesCreateAccountStep({
  steps,
  currentStep,
  setCurrentStep,
  onComplete,
  isOpen,
  onToggle,
}: CirclesCreateAccountStepProps) {
  const slide = steps[currentStep];
  if (!slide) return null;

  return (
    <Accordion
      title="Step 1 - Create your Gnosis App account, and get invited to Circles"
      className="w-full [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-orange [&>button:focus-visible]:ring-offset-2 dark:[&>button:focus-visible]:ring-offset-[#292D35] [&>button]:min-h-20 [&>button]:rounded-[28px] [&>button]:px-8"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="mx-auto w-[calc(100%-60px)] max-w-[1095px] pt-3 md:pt-4">
        <CreateAccountSlide
          slide={slide}
          nav={{
            previousStep: currentStep > 0,
            nextStep: true,
            onPrevious: () => setCurrentStep(currentStep - 1),
            onNext: () =>
              currentStep < steps.length - 1
                ? setCurrentStep(currentStep + 1)
                : onComplete(),
          }}
        />
      </div>
    </Accordion>
  );
}

function CreateAccountSlide({
  slide,
  nav,
}: {
  slide: InfoSlide;
  nav: WizardNavProps;
}) {
  return (
    <div className="border-stroke bg-whiteBackground flex flex-col overflow-hidden rounded-[28px] border md:h-[591px] md:flex-row">
      <div className="bg-primaryBackground order-2 flex w-full flex-col rounded-[28px] p-6 shadow-[0_4px_32px_12px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_32px_12px_rgba(255,255,255,0.16)] md:order-1 md:w-[519px] md:shrink-0 md:p-8">
        <div className="flex min-h-[150px] flex-col">
          <p className="text-primaryText text-xl font-semibold md:text-2xl">
            {slide.title}
          </p>
          <p className="text-secondaryText mt-4 text-sm">
            {addLinkToText(slide.description)}
          </p>
          {slide.disclaimer && (
            <div className="text-secondaryText mt-4 text-sm">
              <span className="text-red-500">IMPORTANT:</span> You need to be
              invited into Circles to be able to join the group.
            </div>
          )}
        </div>
        <WizardNav
          {...nav}
          className="mt-auto justify-start md:[&>button]:min-w-[170px]"
        />
      </div>
      <div className="order-1 flex flex-1 items-center justify-center p-4 md:order-2 md:p-6">
        <Image
          src={slide.image || ""}
          alt={slide.title}
          width={300}
          height={541}
          className="h-auto max-h-[250px] w-full object-contain sm:max-h-[350px] md:max-h-[541px]"
        />
      </div>
    </div>
  );
}
