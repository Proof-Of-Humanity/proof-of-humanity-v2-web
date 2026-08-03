"use client";
import React, { useState } from "react";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";

export type StepCarouselProps = {
  slides: InfoSlide[];
  /** When set, the right arrow stays enabled on the last slide ("Complete and
   * continue") and fires when it is clicked. */
  onComplete?: () => void;
  // ponytail: class knobs preserve the styling drift between the pre-existing
  // Circles/Seer/PNK carousels — collapse them once design blesses one style
  arrowClasses?: {
    row?: string;
    icon?: string;
    enabled?: string;
    disabled?: string;
  };
  /** Card body. Place `arrows` wherever the layout wants the navigation row. */
  children: (args: {
    slide: InfoSlide;
    index: number;
    arrows: React.ReactNode;
  }) => React.ReactNode;
};

function Arrow({
  Icon,
  enabled,
  onClick,
  label,
  className,
}: {
  Icon: React.FC<React.SVGProps<SVGElement>>;
  enabled: boolean;
  onClick: () => void;
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
    >
      <Icon width={32} height={32} className={className} />
    </button>
  );
}

export default function StepCarousel({
  slides,
  onComplete,
  arrowClasses = {},
  children,
}: StepCarouselProps) {
  const [index, setIndex] = useState(0);

  const slide = slides[index];
  if (!slide) return null;

  const isLast = index === slides.length - 1;
  const hasPrevious = index > 0;
  const hasNext = !isLast || !!onComplete;

  const handlePrevious = () => {
    if (!hasPrevious) return;
    setIndex(index - 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
    } else {
      setIndex(index + 1);
    }
  };

  const iconClass = (enabled: boolean) =>
    `${arrowClasses.icon ?? ""} ${
      enabled
        ? `cursor-pointer opacity-100 ${arrowClasses.enabled ?? ""}`
        : `pointer-events-none cursor-not-allowed ${arrowClasses.disabled ?? "opacity-50"}`
    }`.trim();

  const arrows =
    slides.length > 1 || onComplete ? (
      <div
        role="group"
        aria-label="Step navigation"
        className={arrowClasses.row ?? "mt-4 flex gap-4 md:mt-6 md:gap-6"}
      >
        <span className="sr-only" aria-live="polite">
          Step {index + 1} of {slides.length}
        </span>
        <Arrow
          Icon={LeftArrowIcon}
          enabled={hasPrevious}
          onClick={handlePrevious}
          label="Previous step"
          className={iconClass(hasPrevious)}
        />
        <Arrow
          Icon={RightArrowIcon}
          enabled={hasNext}
          onClick={handleNext}
          label={isLast && onComplete ? "Complete and continue" : "Next step"}
          className={iconClass(hasNext)}
        />
      </div>
    ) : null;

  return <>{children({ slide, index, arrows })}</>;
}
