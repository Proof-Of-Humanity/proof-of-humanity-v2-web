"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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

type AnimationState = 'idle' | 'exiting' | 'entering';

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
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');
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
    
    setAnimationState('entering');
    const timer = setTimeout(() => {
      setAnimationState('idle');
    }, 300);
    prevIndexRef.current = currentIndex;
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (!previousStep || animationState !== 'idle') return;
    setExitDirection('right');
    setAnimationState('exiting');
    setTimeout(() => {
      onPrevious();
    }, 200);
  }, [previousStep, animationState, onPrevious]);

  const handleNext = useCallback(() => {
    if (animationState !== 'idle') return;
    
    if (isLastSlide && onLastSlideComplete) {
      // Show PoH logo exit animation
      setShowExitAnimation(true);
      setTimeout(() => {
        onLastSlideComplete();
      }, 1200);
    } else if (nextStep) {
      setExitDirection('left');
      setAnimationState('exiting');
      setTimeout(() => {
        onNext();
      }, 200);
    }
  }, [nextStep, isLastSlide, animationState, onNext, onLastSlideComplete]);

  const getAnimationClass = () => {
    if (showExitAnimation) {
      return 'animate-fadeOut';
    }
    switch (animationState) {
      case 'exiting':
        return exitDirection === 'left' ? 'animate-slideOutLeft' : 'animate-slideOutRight';
      case 'entering':
        return exitDirection === 'left' ? 'animate-slideInFromRight' : 'animate-slideInFromLeft';
      default:
        return '';
    }
  };

  // Show PoH logo animation overlay when transitioning to claim page
  if (showExitAnimation) {
    return (
      <div className="backdrop z-50">
        <div className="flex flex-col items-center">
          <Image
            alt="PoH Logo"
            className="animate-flip"
            src="/logo/poh-colored.svg"
            width={48}
            height={48}
          />
          <p className="text-white mt-6 text-lg font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Calculate aspect ratio to determine object fit
  const getObjectFitClass = () => {
    if (step.imageWidth && step.imageHeight) {
      const ratio = step.imageWidth / step.imageHeight;
      // 16:9 is ~1.77. If ratio is > 2.2 (wide) or < 1.4 (tall/square), use contain to prevent bad cropping
      if (ratio > 2.2 || ratio < 1.4) {
        return 'object-contain';
      }
    }
    // Fallback for last slide if dimensions aren't provided, or default to cover
    return isLastSlide ? 'object-contain' : 'object-cover';
  };

  const isAnimating = animationState !== 'idle';

  return (
    <div className={`flex h-full flex-col border rounded-[30px] shadow w-full max-w-[1095px] border-stroke overflow-hidden transition-all duration-200 ${getAnimationClass()}`}>
      <div className="flex justify-center items-center rounded-t-[30px] w-full overflow-hidden px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-whiteBackground">
        {/* Use a fixed height container that matches the aspect-video height on large screens to maintain consistency */}
        <div className="relative w-full aspect-video flex items-center justify-center">
          <Image
            src={step.image || ''}
            alt={step.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
            className={`rounded-md border-stroke border shadow transition-opacity duration-300 ${getObjectFitClass()}`}
            priority={currentIndex === 0}
          />
        </div>
      </div>
      {/* Fixed height container for text content to prevent layout shifts */}
      <div className="p-4 md:p-6 flex flex-col bg-primaryBackground rounded-b-[30px] h-[420px]">
        <p className="text-primaryText text-xl md:text-2xl font-semibold line-clamp-2 min-h-[56px] md:min-h-[64px]">
          {step.title}
        </p>
        <div className="text-primaryText mt-4 flex-1 text-sm md:text-base overflow-y-auto">
          {addLinkToText(step.description)}
        </div>
        {step.bulletPoints && step.bulletPoints.length > 0 && (
          <FeatureList 
            items={step.bulletPoints.map((point): FeatureItem => ({
              text: point,
              iconType: 'check'
            }))} 
            className="mt-4"
            textClassName="text-primaryText text-sm md:text-base"
          />
        )}
        <div className="flex mt-4 md:mt-6 space-x-2 md:space-x-4">
          <LeftArrowIcon 
            width={32} 
            height={32} 
            className={`transition-all duration-200 ${previousStep && !isAnimating ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            onClick={handlePrevious}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => previousStep && !isAnimating && e.key === 'Enter' && handlePrevious()}
            aria-label="Previous step"
            role="button"
            tabIndex={previousStep && !isAnimating ? 0 : -1}
          />
          <RightArrowIcon 
            width={32} 
            height={32} 
            className={`ml-2 transition-all duration-200 ${(nextStep || isLastSlide) && !isAnimating ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            onClick={handleNext}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => (nextStep || isLastSlide) && !isAnimating && e.key === 'Enter' && handleNext()}
            aria-label={isLastSlide ? "Complete and continue" : "Next step"}
            role="button"
            tabIndex={(nextStep || isLastSlide) && !isAnimating ? 0 : -1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessStepCard; 