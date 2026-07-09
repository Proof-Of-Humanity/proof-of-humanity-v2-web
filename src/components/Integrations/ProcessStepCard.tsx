"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";
import WizardNav from "components/Integrations/WizardNav";

export type ProcessStepCardProps = {
  allSlides: InfoSlide[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onLastSlideComplete?: () => void;
};

type AnimationState = "idle" | "exiting" | "entering";

const getObjectFitClass = (slide: InfoSlide, isLast: boolean) => {
  if (slide.imageWidth && slide.imageHeight) {
    const ratio = slide.imageWidth / slide.imageHeight;
    if (ratio > 2.2 || ratio < 1.4) {
      return "object-contain";
    }
  }
  return isLast ? "object-contain" : "object-cover";
};

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  allSlides,
  currentIndex,
  onPrevious,
  onNext,
  onLastSlideComplete,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");
  const [showExitAnimation, setShowExitAnimation] = useState(false);
  const prevIndexRef = useRef(currentIndex);

  const previousStep = currentIndex > 0;
  const nextStep = currentIndex < allSlides.length - 1;
  const isLastSlide = currentIndex === allSlides.length - 1;

  useEffect(() => {
    if (prevIndexRef.current === currentIndex) return;

    setAnimationState("entering");
    const timer = setTimeout(() => {
      setAnimationState("idle");
    }, 300);
    prevIndexRef.current = currentIndex;
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (!previousStep || animationState !== "idle") return;
    setExitDirection("right");
    setAnimationState("exiting");
    setTimeout(() => {
      onPrevious();
    }, 160);
  }, [previousStep, animationState, onPrevious]);

  const handleNext = useCallback(() => {
    if (animationState !== "idle") return;

    if (isLastSlide && onLastSlideComplete) {
      // Show PoH logo exit animation
      setShowExitAnimation(true);
      setTimeout(() => {
        onLastSlideComplete();
      }, 1200);
    } else if (nextStep) {
      setExitDirection("left");
      setAnimationState("exiting");
      setTimeout(() => {
        onNext();
      }, 160);
    }
  }, [nextStep, isLastSlide, animationState, onNext, onLastSlideComplete]);

  const getAnimationClass = () => {
    if (showExitAnimation) {
      return "animate-fadeOut";
    }
    switch (animationState) {
      case "exiting":
        return exitDirection === "left"
          ? "animate-wizardOutLeft"
          : "animate-wizardOutRight";
      case "entering":
        return exitDirection === "left"
          ? "animate-wizardInRight"
          : "animate-wizardInLeft";
      default:
        return "";
    }
  };

  // Show PoH logo animation overlay when transitioning to claim page
  if (showExitAnimation) {
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
  }

  const isAnimating = animationState !== "idle";
  const animationClass = getAnimationClass();

  return (
    <div className="grid w-full max-w-[1095px]">
      {allSlides.map((slide, i) => {
        const isCurrent = i === currentIndex;
        const isLast = i === allSlides.length - 1;
        return (
          <div
            key={slide.id ?? i}
            aria-hidden={!isCurrent}
            className={`col-start-1 row-start-1 flex w-full flex-col ${
              isCurrent ? animationClass : "invisible"
            }`}
          >
            {/* Screenshot - fixed aspect box so the visual anchor is
                identical on every slide */}
            <div className="mt-4 flex w-full justify-center px-2 sm:px-6 lg:mt-6">
              <div className="relative aspect-video w-full max-w-[900px]">
                <Image
                  src={slide.image || ""}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                  className={`rounded-2xl ${getObjectFitClass(slide, isLast)}`}
                  priority={i === 0}
                />
              </div>
            </div>

            <div className="border-stroke mx-2 mt-6 border-t sm:mx-6 lg:mt-8" />

            <div className="flex flex-1 flex-col px-2 py-5 sm:px-6 lg:py-6">
              <p className="text-primaryText text-xl font-semibold md:text-2xl">
                {slide.title}
              </p>
              <div className="text-secondaryText mt-4 text-sm leading-relaxed md:text-base">
                {addLinkToText(slide.description)}
              </div>
              {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                <FeatureList
                  items={slide.bulletPoints.map(
                    (point): FeatureItem => ({
                      text: point,
                      iconType: "check",
                    }),
                  )}
                  className="mt-4"
                  iconWidth={20}
                  iconHeight={20}
                  iconClassName="flex-shrink-0 fill-status-registered"
                  textClassName="text-status-registered text-sm md:text-base"
                />
              )}
              <WizardNav
                previousStep={i > 0 && !isAnimating}
                nextStep={!isAnimating}
                onPrevious={handlePrevious}
                onNext={handleNext}
                className="mt-auto pt-4 md:pt-6"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessStepCard;
