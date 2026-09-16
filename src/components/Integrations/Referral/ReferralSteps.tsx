"use client";

import { Fragment } from "react";
import cn from "classnames";
import {
  REFERRAL_STEPS,
  REFERRAL_STEP_LABELS,
  REFERRAL_STEP_TOOLTIPS,
} from "data/referralPresentation";
import { ReferralStep } from "types/referral";

interface ReferralStepsProps {
  active: ReferralStep;
  /** Funnel is stopped (flagged/rejected/needs review): freeze + dim the track. */
  halted?: boolean;
}

/** Hover/focus tooltip bubble; native `title` is invisible on touch. */
const StepTip: React.FC<{
  text?: string;
  children: React.ReactNode;
}> = ({ text, children }) =>
  text ? (
    <span className="group relative inline-flex" tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className="border-stroke bg-grey text-primaryText pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[min(232px,calc(100vw-2rem))] -translate-x-1/2 rounded-input border p-3 text-center text-xs font-normal leading-[normal] opacity-0 shadow-soft transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  ) : (
    children
  );

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
              className="text-secondaryText/70 w-6 select-none text-center text-sm font-light leading-none"
              aria-hidden="true"
            >
              {">"}
            </span>
          )}
          <StepTip text={halted ? undefined : REFERRAL_STEP_TOOLTIPS[step]}>
            {index === activeIndex ? (
              <span
                aria-current="step"
                className={cn(
                  "inline-flex items-center rounded-full border-[1.5px] px-2 pb-[5px] pt-[3px] text-xs",
                  halted
                    ? "text-secondaryText border-white/25"
                    : "border-peach text-peach",
                )}
              >
                {REFERRAL_STEP_LABELS[step]}
              </span>
            ) : (
              <span
                aria-label={`${index + 1}. ${REFERRAL_STEP_LABELS[step]}`}
                className="text-secondaryText border-stroke flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-xs"
              >
                {index + 1}
              </span>
            )}
          </StepTip>
        </Fragment>
      ))}
    </div>
  );
};

export default ReferralSteps;
