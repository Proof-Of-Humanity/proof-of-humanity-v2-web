import React from "react";
import Accordion from "components/Accordion";
import IntegrationInfoCard from "components/Integrations/IntegrationInfoCard";
import { InfoSlide } from "types/integrations";

interface CirclesCreateAccountStepProps {
  steps: InfoSlide[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CirclesCreateAccountStep({
  steps,
  currentStep,
  setCurrentStep,
  isOpen,
  onToggle,
}: CirclesCreateAccountStepProps) {
  const step = steps[currentStep];
  if (!step) return null;

  return (
    <Accordion
      title="Step 1 - Create your Gnosis App account, and get invited to Circles"
      className="w-full"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="p-4 md:p-6">
        <IntegrationInfoCard
          step={step}
          onPrevious={() => setCurrentStep(currentStep - 1)}
          onNext={() => setCurrentStep(currentStep + 1)}
          previousStep={currentStep > 0}
          nextStep={currentStep < steps.length - 1}
        />
      </div>
    </Accordion>
  );
}
