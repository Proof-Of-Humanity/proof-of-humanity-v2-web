"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";

export type ProcessStepCardProps = {
  step: InfoSlide;
  allSlides: InfoSlide[];
  currentIndex: number;
  previousStep: boolean;
  nextStep: boolean;
  isLastSlide: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onLastSlideComplete?: () => void;
};

type AnimationState = "idle" | "exiting" | "entering";

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  step,
  allSlides,
  currentIndex,
  previousStep,
  nextStep,
  isLastSlide,
  onPrevious,
  onNext,
  onLastSlideComplete,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");
  const [showExitAnimation, setShowExitAnimation] = useState(false);
  const preloadedImages = useRef<Set<string>>(new Set());
  const prevIndexRef = useRef(currentIndex);

  // Preload ALL images on mount
  useEffect(() => {
    allSlides.forEach((slide) => {
      if (slide.image && !preloadedImages.current.has(slide.image)) {
        const img = new window.Image();
        img.src = slide.image;
        preloadedImages.current.add(slide.image);
      }
    });
  }, [allSlides]);

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
    }, 250);
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
      }, 250);
    }
  }, [nextStep, isLastSlide, animationState, onNext, onLastSlideComplete]);

  const getAnimationClass = () => {
    if (showExitAnimation) {
      return "animate-fadeOut";
    }
    switch (animationState) {
      case "exiting":
        return exitDirection === "left"
          ? "animate-slideOutLeft"
          : "animate-slideOutRight";
      case "entering":
        return exitDirection === "left"
          ? "animate-slideInFromRight"
          : "animate-slideInFromLeft";
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

  // Calculate aspect ratio to determine object fit
  const getObjectFitClass = () => {
    if (step.imageWidth && step.imageHeight) {
      const ratio = step.imageWidth / step.imageHeight;
      // 16:9 is ~1.77. If ratio is > 2.2 (wide) or < 1.4 (tall/square), use contain to prevent bad cropping
      if (ratio > 2.2 || ratio < 1.4) {
        return "object-contain";
      }
    }
    // Fallback for last slide if dimensions aren't provided, or default to cover
    return isLastSlide ? "object-contain" : "object-cover";
  };

  const isAnimating = animationState !== "idle";

  return (
    <div
      className={`border-stroke flex h-full w-full max-w-[1095px] flex-col overflow-hidden rounded-[30px] border transition-all duration-200 ${getAnimationClass()}`}
    >
      <div className="bg-whiteBackground flex w-full items-center justify-center overflow-hidden rounded-t-[30px] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {/* Use a fixed height container that matches the aspect-video height on large screens to maintain consistency */}
        <div className="relative flex aspect-video w-full items-center justify-center">
          <Image
            src={step.image || ""}
            alt={step.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
            className={`border-stroke rounded-md border transition-opacity duration-300 ${getObjectFitClass()}`}
            priority={currentIndex === 0}
          />
        </div>
      </div>
      {/* Fixed height container for text content to prevent layout shifts */}
      <div className="bg-primaryBackground flex h-[420px] flex-col rounded-b-[30px] p-4 md:p-6">
        <p className="text-primaryText line-clamp-2 min-h-[56px] text-xl font-semibold md:min-h-[64px] md:text-2xl">
          {step.title}
        </p>
        <div className="text-primaryText mt-4 flex-1 overflow-y-auto text-sm md:text-base">
          {addLinkToText(step.description)}
        </div>
        {step.bulletPoints && step.bulletPoints.length > 0 && (
          <FeatureList
            items={step.bulletPoints.map(
              (point): FeatureItem => ({
                text: point,
                iconType: "check",
              }),
            )}
            className="mt-4"
            textClassName="text-primaryText text-sm md:text-base"
          />
        )}
        <div className="mt-4 flex space-x-2 md:mt-6 md:space-x-4">
          <LeftArrowIcon
            width={32}
            height={32}
            className={`transition-all duration-200 ${previousStep && !isAnimating ? "cursor-pointer opacity-100 hover:scale-110" : "pointer-events-none cursor-not-allowed opacity-50"}`}
            onClick={handlePrevious}
            onKeyDown={(e: React.KeyboardEvent<SVGElement>) =>
              previousStep &&
              !isAnimating &&
              (e.key === "Enter" || e.key === " " || e.key === "Spacebar") &&
              handlePrevious()
            }
            aria-label="Previous step"
            aria-disabled={!(previousStep && !isAnimating)}
            role="button"
            tabIndex={previousStep && !isAnimating ? 0 : -1}
          />
          <RightArrowIcon
            width={32}
            height={32}
            className={`ml-2 transition-all duration-200 ${(nextStep || isLastSlide) && !isAnimating ? "cursor-pointer opacity-100 hover:scale-110" : "pointer-events-none cursor-not-allowed opacity-50"}`}
            onClick={handleNext}
            onKeyDown={(e: React.KeyboardEvent<SVGElement>) =>
              (nextStep || isLastSlide) &&
              !isAnimating &&
              (e.key === "Enter" || e.key === " " || e.key === "Spacebar") &&
              handleNext()
            }
            aria-label={isLastSlide ? "Complete and continue" : "Next step"}
            aria-disabled={!((nextStep || isLastSlide) && !isAnimating)}
            role="button"
            tabIndex={(nextStep || isLastSlide) && !isAnimating ? 0 : -1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessStepCard;
