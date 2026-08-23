"use client";

import { Fragment } from "react";
import cn from "classnames";
import {
  REFERRAL_STEPS,
  REFERRAL_STEP_LABELS,
} from "data/referralPresentation";
import { ReferralStep } from "types/referral";

interface ReferralStepsProps {
  active: ReferralStep;
  /** Funnel is stopped (flagged/rejected/needs review): freeze + dim the track. */
  halted?: boolean;
}

// Per-referral progress track: Referral: (Started) > 2 > 3 > 4 > 5
// Only the active step is highlighted (peach outline pill); all other steps are
// uniform muted numbered circles. A halted track keeps the step it stopped at
// but renders fully muted so it reads as paused, not progressing — the row
// badge carries the reason.
const ReferralSteps: React.FC<ReferralStepsProps> = ({ active, halted }) => {
  const activeIndex = REFERRAL_STEPS.indexOf(active);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-1",
        halted && "opacity-50",
      )}
      aria-label={`Referral progress: ${REFERRAL_STEP_LABELS[active]}${
        halted ? " (halted)" : ""
      }`}
    >
      <span className="text-secondaryText mr-2 text-xs">Referral:</span>
      {REFERRAL_STEPS.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && (
            <span
              className="text-secondaryText w-[31px] select-none text-center text-2xl leading-none"
              aria-hidden="true"
            >
              {">"}
            </span>
          )}
          {index === activeIndex ? (
            <span
              aria-current="step"
              className={cn(
                "inline-flex items-center rounded-full border px-2 pb-[5px] pt-[3px] text-xs",
                halted
                  ? "text-secondaryText border-white/25"
                  : "border-peach text-peach",
              )}
            >
              {REFERRAL_STEP_LABELS[step]}
            </span>
          ) : (
            <span
              title={`${index + 1}. ${REFERRAL_STEP_LABELS[step]}`}
              className="text-secondaryText border-stroke flex h-6 w-6 items-center justify-center rounded-full border text-xs"
            >
              {index + 1}
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default ReferralSteps;
