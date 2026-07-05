"use client";

import { Fragment } from "react";
import cn from "classnames";
import { REFERRAL_STEPS, REFERRAL_STEP_LABELS } from "data/referral";
import { ReferralStep } from "types/referral";

interface ReferralStepsProps {
  active: ReferralStep;
  /** Funnel is stopped (flagged/rejected/needs review): freeze + dim the track. */
  halted?: boolean;
}

// Per-referral progress track: Referral: (Started) > 2 > 3 > 4 > 5
// Only the active step is highlighted (peach outline pill); all other steps are
// uniform muted numbered circles. A halted track keeps the
// step it stopped at but renders fully muted so it reads as paused, not
// progressing — the row badge carries the reason.
const ReferralSteps: React.FC<ReferralStepsProps> = ({ active, halted }) => {
  const activeIndex = REFERRAL_STEPS.indexOf(active);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xs",
        halted && "opacity-50",
      )}
      aria-label={`Referral progress: ${REFERRAL_STEP_LABELS[active]}${
        halted ? " (halted)" : ""
      }`}
    >
      <span className="text-secondaryText mr-0.5">Referral:</span>
      {REFERRAL_STEPS.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && (
            <span className="text-secondaryText select-none" aria-hidden="true">
              {">"}
            </span>
          )}
          {index === activeIndex ? (
            <span
              aria-current="step"
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold",
                halted
                  ? "text-secondaryText border-white/25"
                  : "text-orange border-peach",
              )}
            >
              {REFERRAL_STEP_LABELS[step]}
            </span>
          ) : (
            <span
              title={`${index + 1}. ${REFERRAL_STEP_LABELS[step]}`}
              className="text-secondaryText inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-[11px] font-semibold"
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
