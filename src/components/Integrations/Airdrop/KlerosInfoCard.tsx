"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { InfoSlide } from "types/integrations";
import { addLinkToText } from "components/addLinkToText";
import FeatureList, { FeatureItem } from "components/FeatureList";
import BecomeJurorCard from "components/Integrations/Airdrop/BecomeJurorCard";
import WizardNav from "components/Integrations/WizardNav";

export type KlerosInfoCardProps = {
  slides: InfoSlide[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onLastSlideComplete?: () => void;
};

type AnimationState = "idle" | "exiting" | "entering";

const KlerosInfoCard: React.FC<KlerosInfoCardProps> = ({
  slides,
  currentIndex,
  onPrevious,
  onNext,
  onLastSlideComplete,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");
  const prevIndexRef = useRef(currentIndex);

  const previousStep = currentIndex > 0;
  const nextStep = currentIndex < slides.length - 1;
  const isLastSlide = currentIndex === slides.length - 1;

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
      setExitDirection("left");
      setAnimationState("exiting");
      setTimeout(() => {
        onLastSlideComplete();
      }, 160);
    } else if (nextStep) {
      setExitDirection("left");
      setAnimationState("exiting");
      setTimeout(() => {
        onNext();
      }, 160);
    }
  }, [nextStep, isLastSlide, animationState, onNext, onLastSlideComplete]);

  const getAnimationClass = () => {
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

  const isAnimating = animationState !== "idle";
  const animationClass = getAnimationClass();

  return (
    <div className="mx-auto grid w-full max-w-[1095px]">
      {slides.map((slide, i) => {
        const isCurrent = i === currentIndex;
        const cellClass = `col-start-1 row-start-1 flex w-full flex-col ${
          isCurrent ? animationClass : "invisible"
        }`;

        // Use special component for "becomeJuror" slide
        if (slide.id === "becomeJuror") {
          return (
            <div key={slide.id} aria-hidden={!isCurrent} className={cellClass}>
              <BecomeJurorCard
                slide={slide}
                previousStep={i > 0 && !isAnimating}
                nextStep={!isAnimating}
                onPrevious={handlePrevious}
                onNext={handleNext}
                className="flex-1"
              />
            </div>
          );
        }

        return (
          <div
            key={slide.id ?? i}
            aria-hidden={!isCurrent}
            className={cellClass}
          >
            {slide.image && (
              <div className="mt-4 flex w-full justify-center px-2 sm:px-6 lg:mt-6">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={900}
                  height={521}
                  className="h-auto w-full max-w-[900px] rounded-2xl"
                  priority={i === 0}
                />
              </div>
            )}

            <div className="border-stroke mx-2 mt-6 border-t sm:mx-6 lg:mt-8" />

            <div className="flex flex-1 flex-col px-2 py-5 sm:px-6 lg:py-6">
              <h2 className="text-primaryText mb-3 text-xl font-semibold leading-[1.36] sm:text-2xl lg:mb-4">
                {slide.title}
              </h2>

              <div className="text-secondaryText mb-2 whitespace-pre-line text-sm leading-relaxed sm:text-base">
                {addLinkToText(slide.description)}
              </div>

              {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                <div className="mb-4 mt-4 lg:mb-6">
                  <FeatureList
                    items={slide.bulletPoints.map(
                      (point): FeatureItem => ({
                        text: point,
                        iconType: "check",
                      }),
                    )}
                    spacing="compact"
                    iconWidth={20}
                    iconHeight={20}
                    iconClassName="flex-shrink-0 fill-status-registered"
                    textClassName="text-status-registered text-sm sm:text-base leading-[1.36] whitespace-pre-line"
                    className=""
                  />
                </div>
              )}

              <WizardNav
                previousStep={i > 0 && !isAnimating}
                nextStep={!isAnimating}
                onPrevious={handlePrevious}
                onNext={handleNext}
                className="mt-auto pt-4"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KlerosInfoCard;
