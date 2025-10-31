import React from 'react';
import Accordion from 'components/Accordion';
import ProcessStepCard from 'components/Integrations/ProcessStepCard';
import { ConnectionStep } from 'types/integrations';

interface CirclesMintTokensStepProps {
  steps: ConnectionStep[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CirclesMintTokensStep({
  steps,
  currentStep,
  setCurrentStep,
  isOpen,
  onToggle
}: CirclesMintTokensStepProps) {
  if (!steps || steps.length === 0) return null;
  
  return (
    <Accordion 
      title="Step 3 - Join our group on Metri and earn $CRC" 
      className="w-full"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="p-4 md:p-6 flex flex-col w-full">
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