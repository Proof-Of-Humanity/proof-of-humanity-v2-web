import React from 'react';
import Accordion from 'components/Accordion';
import IntegrationInfoCard from 'components/Integrations/IntegrationInfoCard';
import { ConnectionStep } from 'types/integrations';

interface CirclesCreateAccountStepProps {
  steps: ConnectionStep[];
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
  onToggle
}: CirclesCreateAccountStepProps) {
  if (!steps || steps.length === 0) return null;
  
  return (
    <Accordion 
      title="Step 1 - Create your Circles account and get invited" 
      className="w-full"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="p-4 md:p-6">
        <IntegrationInfoCard 
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