import React from 'react';
import Accordion from 'components/Accordion';
import ProcessStepCard from 'components/Integrations/ProcessStepCard';
import { ConnectionStep } from 'types/integrations';

interface CirclesMintTokensStepProps {
  steps: ConnectionStep[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function CirclesMintTokensStep({
  steps,
  currentStep,
  setCurrentStep
}: CirclesMintTokensStepProps) {
  if (!steps || steps.length === 0) return null;
  
  return (
    <Accordion title="Step 3 - Mint your POH Circles group tokens" className="w-full">
      <div className="p-6 flex flex-col w-full">
        <ProcessStepCard 
          step={steps[currentStep]} 
          onPrevious={() => setCurrentStep(currentStep - 1)}
          onNext={() => setCurrentStep(currentStep + 1)}
          previousStep={currentStep > 0}
          nextStep={currentStep < steps.length - 1}
        />
      </div>
    </Accordion>
  );
} 