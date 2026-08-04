"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { InfoSlide } from "types/integrations";

/** Everything a slide's navigation control needs — spread onto `WizardNav`
 * (or any card that renders its own nav, e.g. `BecomeJurorCard`). */
export type StepNavProps = {
  previousStep: boolean;
  nextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

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
  /** Cover the screen with the PoH loading overlay while completing. */
  exitOverlay?: boolean;
  /** Body of one slide. Render the nav wherever the layout wants it. */
  children: (args: {
    slide: InfoSlide;
    index: number;
    isCurrent: boolean;
    nav: StepNavProps;
  }) => React.ReactNode;
};

type Dir = "left" | "right";

/** The carousel's whole lifecycle as one value, so no combination of
 * direction/animation/overlay flags can ever disagree with itself.
 * `exiting` carries the navigation to commit once its animation ends. */
type Phase =
  | { name: "idle" }
  | { name: "exiting"; dir: Dir; commit: () => void }
  | { name: "entering"; dir: Dir }
  | { name: "overlay" };

/** Animation class per phase. Durations live in the CSS animations
 * (`tailwind.config.cjs`); the state machine advances on `animationend`,
 * so JS timings can't drift from the CSS. An exit to the left brings the
 * next slide in from the right, and vice versa. */
const ANIM: Record<"exiting" | "entering", Record<Dir, string>> = {
  exiting: { left: "animate-wizardOutLeft", right: "animate-wizardOutRight" },
  entering: { left: "animate-wizardInRight", right: "animate-wizardInLeft" },
};

const OVERLAY_MS = 1200;

const CompletionOverlay: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, OVERLAY_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return createPortal(
    <div className="backdrop z-50">
      <div className="flex flex-col items-center">
        <Image
          alt="PoH Logo"
          className="animate-flip"
          src="/logo/poh-colored.svg"
          width={48}
          height={48}
        />
        <p className="mt-6 animate-pulse text-lg font-medium text-white">
          Loading...
        </p>
      </div>
    </div>,
    document.body,
  );
};

const StepCarousel: React.FC<StepCarouselProps> = ({
  slides,
  currentIndex,
  onPrevious,
  onNext,
  onLastSlideComplete,
  className = "grid w-full max-w-[1095px]",
  exitOverlay = false,
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
      if (exitOverlay) setPhase({ name: "overlay" });
      else navigate("left", onLastSlideComplete);
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

  if (phase.name === "overlay") {
    return <CompletionOverlay onDone={onLastSlideComplete!} />;
  }

  const animationClass = idle ? "" : ANIM[phase.name][phase.dir];

  return (
    <div className={className}>
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
            {children({
              slide,
              index: i,
              isCurrent,
              nav: {
                previousStep: i > 0 && idle,
                nextStep: idle,
                onPrevious: handlePrevious,
                onNext: handleNext,
              },
            })}
          </div>
        );
      })}
    </div>
  );
};

export default StepCarousel;
