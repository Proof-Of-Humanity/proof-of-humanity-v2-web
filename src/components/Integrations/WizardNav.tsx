"use client";
import React from "react";

export interface WizardNavProps {
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel?: string;
  className?: string;
}

/**
 * Centered Back / Next pill navigation used by every integration wizard card
 * (outlined Back, gradient-filled Next). Both buttons always render;
 * an unavailable direction is disabled, never hidden.
 */
const WizardNav: React.FC<WizardNavProps> = ({
  previousStep,
  nextStep,
  onPrevious,
  onNext,
  nextLabel = "Next",
  className = "",
}) => (
  <div className={`flex items-center justify-center gap-4 ${className}`}>
    <button
      type="button"
      className="btn-secondary w-32 md:w-40"
      onClick={onPrevious}
      disabled={!previousStep}
      aria-label="Previous step"
    >
      Back
    </button>
    <button
      type="button"
      className="btn-primary w-32 md:w-40"
      onClick={onNext}
      disabled={!nextStep}
      aria-label={nextLabel === "Next" ? "Next step" : nextLabel}
    >
      {nextLabel}
    </button>
  </div>
);

export default WizardNav;
