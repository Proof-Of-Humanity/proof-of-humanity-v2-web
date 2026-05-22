"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface LoadableImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export default function LoadableImage({
  src,
  alt,
  className,
  fallbackLabel = "Image unavailable",
}: LoadableImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const image = imageRef.current;

    setIsLoading(true);
    setHasError(false);

    if (!image?.complete) return;

    setIsLoading(false);
    setHasError(image.naturalWidth === 0);
  }, [src]);

  return (
    <>
      {isLoading && !hasError ? (
        <div className={twMerge("bg-grey animate-pulse", className)} />
      ) : null}
      {hasError ? (
        <div
          className={twMerge(
            "bg-grey text-secondaryText flex items-center justify-center p-4 text-center text-sm",
            className,
          )}
        >
          {fallbackLabel}
        </div>
      ) : null}
      <img
        ref={imageRef}
        alt={alt}
        className={twMerge(className, (isLoading || hasError) && "hidden")}
        src={src}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
