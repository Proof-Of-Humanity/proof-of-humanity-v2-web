"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import LeftArrowIcon from "icons/ArrowCircleLeft.svg";
import RightArrowIcon from "icons/ArrowCircleRight.svg";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";
import BecomeJurorCard from "components/Integrations/Airdrop/BecomeJurorCard";

export type KlerosInfoCardProps = {
  slide: InfoSlide;
  previousStep: boolean;
  nextStep: boolean;
  isLastSlide?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onLastSlideComplete?: () => void;
};

type AnimationState = 'idle' | 'exiting' | 'entering';

const KlerosInfoCard: React.FC<KlerosInfoCardProps> = ({
  slide,
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
  const prevSlideIdRef = useRef(slide.id);

  useEffect(() => {
    if (prevSlideIdRef.current === slide.id) return;
    
    setAnimationState('entering');
    const timer = setTimeout(() => {
      setAnimationState('idle');
    }, 300);
    prevSlideIdRef.current = slide.id;
    return () => clearTimeout(timer);
  }, [slide.id]);

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
          <p className="text-white mt-6 text-lg font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>,
      document.body
    );
  }

  const animationClass = `transition-all duration-200 ${getAnimationClass()}`;

  // Use special component for "becomeJuror" slide
  if (slide.id === "becomeJuror") {
    return (
      <BecomeJurorCard
        slide={slide}
        previousStep={previousStep}
        nextStep={nextStep || !!isLastSlide}
        onPrevious={handlePrevious}
        onNext={handleNext}
        className={animationClass}
      />
    );
  }

  const isAnimating = animationState !== 'idle';

  return (
    <div className={`flex flex-col border rounded-[30px] shadow w-full max-w-[1095px] h-auto lg:h-[1035px] mx-auto ${animationClass}`}>
      {/* Image Container - Responsive with fixed aspect ratio */}
      <div className="flex justify-center w-full overflow-hidden rounded-t-[30px]">
        <div className="w-full lg:w-[900px] h-full px-4 sm:px-8 lg:px-0 mt-6 mb-2 lg:mt-12">
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              width={900}
              height={521}
              className="h-auto max-h-[200px] sm:max-h-[300px] my-4 sm:my-6 md:h-auto md:max-h-[521px] md:my-8 rounded-xl border-stroke border shadow"
            />
          )}
        </div>
      </div>
      
      {/* Content Container - Responsive with flexible height */}
      <div className="flex flex-col flex-1 bg-primaryBackground rounded-[30px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {/* Title */}
        <h2 className="text-primaryText text-xl sm:text-2xl font-semibold leading-[1.36] mb-3 lg:mb-4">
          {slide.title}
        </h2>
        
        {/* Description */}
        <div className="text-primaryText text-sm sm:text-base leading-[1.36] whitespace-pre-line mb-2">
          {addLinkToText(slide.description)}
        </div>
        
        {/* Bullet Points */}
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <div className="mb-4 lg:mb-6 mt-4">
            <FeatureList
              items={slide.bulletPoints.map((point): FeatureItem => ({
                text: point,
                iconType: 'check'
              }))}
              spacing="compact"
              iconWidth={16}
              iconHeight={16}
              iconClassName="flex-shrink-0 fill-purple"
              textClassName="text-purple text-sm sm:text-base leading-[1.36] whitespace-pre-line"
              className=""
            />
          </div>
        )}
        
        {/* Navigation Arrows - Responsive positioning */}
        <div className="flex items-center gap-3 lg:gap-4 mt-auto">
          <LeftArrowIcon
            width={32}
            height={32}
            className={`${previousStep && !isAnimating ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-[0.12] cursor-not-allowed pointer-events-none'}`}
            onClick={handlePrevious}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => previousStep && !isAnimating && e.key === 'Enter' && handlePrevious()}
            aria-label="Previous step"
            role="button"
            tabIndex={previousStep && !isAnimating ? 0 : -1}
          />
          <RightArrowIcon
            width={32}
            height={32}
            className={`${(nextStep || isLastSlide) && !isAnimating ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-[0.12] cursor-not-allowed pointer-events-none'}`}
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

export default KlerosInfoCard; 