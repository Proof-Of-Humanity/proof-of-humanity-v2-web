"use client";
import React, { useEffect, useState } from "react";
import { InfoSlide } from "types/integrations";
import WizardNav from "components/Integrations/WizardNav";

export type StepCarouselProps = {
  slides: InfoSlide[];
  /** Controlled: the owner keeps the index so it can also derive
   * "slides completed" from it. */
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  /** When set, "Next" on the last slide fires this instead of advancing. */
  onLastSlideComplete?: () => void;
  /** Classes for the grid wrapper that stacks the deck. */
  className?: string;
  /** Body of one slide. The Back/Next nav is rendered once by the
   * carousel itself, below the animated deck, so it never moves. */
  children: (args: {
    slide: InfoSlide;
    index: number;
    isCurrent: boolean;
  }) => React.ReactNode;
};

type Dir = "left" | "right";

type Phase =
  | { name: "idle" }
  | { name: "exiting"; dir: Dir; commit: () => void }
  | { name: "entering"; dir: Dir };

const ANIM: Record<"exiting" | "entering", Record<Dir, string>> = {
  exiting: { left: "animate-wizardOutLeft", right: "animate-wizardOutRight" },
  entering: { left: "animate-wizardInRight", right: "animate-wizardInLeft" },
};

/** Longest wizard keyframe is 0.3s; anything past this means `animationend`
 * is not coming (unpainted subtree, backgrounded tab, stripped animation). */
const ANIM_FALLBACK_MS = 500;

const StepCarousel: React.FC<StepCarouselProps> = ({
  slides,
  currentIndex,
  onPrevious,
  onNext,
  onLastSlideComplete,
  className = "grid w-full max-w-[1095px]",
  children,
}) => {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const idle = phase.name === "idle";
  const previousStep = currentIndex > 0;
  const nextStep = currentIndex < slides.length - 1;

  const navigate = (dir: Dir, commit: () => void) => {
    if (!idle) return;
    setPhase({ name: "exiting", dir, commit });
  };

  const handlePrevious = () => {
    if (previousStep) navigate("right", onPrevious);
  };

  const handleNext = () => {
    if (!idle) return;
    if (nextStep) {
      navigate("left", onNext);
    } else if (onLastSlideComplete) {
      navigate("left", onLastSlideComplete);
    }
  };

  /** Advance the state machine when the current slide's own animation
   * ends. The target guard skips `animationend` events bubbling up from
   * animated children inside the slide. */
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (phase.name === "exiting") {
      phase.commit(); // owner moves `currentIndex`; the new slide enters
      setPhase({ name: "entering", dir: phase.dir });
    } else if (phase.name === "entering") {
      setPhase({ name: "idle" });
    }
  };

  /** Safety net: both nav buttons are gated on `idle`, so a missed
   * `animationend` would strand the wizard with no way for the user to
   * advance or go back. Force the transition through on a timer. */
  useEffect(() => {
    if (phase.name === "idle") return;
    const timer = window.setTimeout(() => {
      if (phase.name === "exiting") {
        phase.commit();
        setPhase({ name: "entering", dir: phase.dir });
      } else {
        setPhase({ name: "idle" });
      }
    }, ANIM_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const animationClass = idle ? "" : ANIM[phase.name][phase.dir];

  return (
    <div className={className}>
      {/* Animated deck: only slide bodies live here, so only they move. */}
      <div className="grid w-full">
        {slides.map((slide, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={slide.id ?? i}
              aria-hidden={!isCurrent}
              onAnimationEnd={isCurrent ? handleAnimationEnd : undefined}
              className={`col-start-1 row-start-1 flex w-full flex-col ${
                isCurrent ? animationClass : "invisible"
              }`}
            >
              {children({ slide, index: i, isCurrent })}
            </div>
          );
        })}
      </div>
      {/* Static nav outside the animated subtree — it never moves. */}
      <WizardNav
        previousStep={previousStep && idle}
        nextStep={idle}
        onPrevious={handlePrevious}
        onNext={handleNext}
        className="pb-5 pt-4 lg:pb-6"
      />
    </div>
  );
};

export default StepCarousel;
