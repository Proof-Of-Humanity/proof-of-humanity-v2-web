import { InfoSlide } from "types/integrations";
import Image from "next/image";
import { addLinkToText } from "components/addLinkToText";
import WizardNav from "components/Integrations/WizardNav";

function IntegrationInfoCard({
  step,
  onPrevious,
  onNext,
  previousStep,
  nextStep,
}: {
  step: InfoSlide;
  onPrevious: () => void;
  onNext: () => void;
  previousStep: boolean;
  nextStep: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[30px] border md:flex-row">
      {/* Left Column: Text content and navigation */}
      <div className="bg-primaryBackground order-2 flex w-full flex-col rounded-[30px] p-4 md:order-1 md:w-1/2 md:p-6">
        <div className="mt-4 flex min-h-[150px] flex-col md:mt-8 md:h-80 md:px-8 lg:mt-20">
          <p className="text-primaryText text-xl font-semibold md:text-2xl">
            {step.title}
          </p>
          <p className="text-primaryText mt-4 text-sm md:mt-6 md:text-base">
            {addLinkToText(step.description)}
          </p>
          {step.disclaimer && (
            <div className="text-primaryText mt-4 text-sm md:text-base">
              <span className="text-red-500">IMPORTANT:</span> You need to be
              invited into Circles to be able to join the group.
            </div>
          )}
        </div>
        {(previousStep || nextStep) && (
          <WizardNav
            previousStep={previousStep}
            nextStep={nextStep}
            onPrevious={onPrevious}
            onNext={onNext}
            className="mt-4"
          />
        )}
      </div>
      {/* Right Column: Image */}
      <div className="order-1 flex w-full items-center justify-center md:order-2 md:w-1/2">
        <Image
          src={step.image || ""}
          alt={step.title}
          width={300}
          height={541}
          className="my-4 h-auto max-h-[250px] w-full object-contain sm:max-h-[350px] md:max-h-[541px]"
        />
      </div>
    </div>
  );
}

export default IntegrationInfoCard;
