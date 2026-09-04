"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import MediaFallback from "./MediaFallback";

interface LoadableImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  errorFallback?: ReactNode;
}

export default function LoadableImage({
  src,
  alt,
  className,
  fallbackLabel = "Image unavailable",
  errorFallback,
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
      {isLoading && !hasError ? <MediaFallback className={className} /> : null}
      {hasError ? (
        (errorFallback ?? (
          <MediaFallback error label={fallbackLabel} className={className} />
        ))
      ) : null}
      <img
        ref={imageRef}
        alt={alt}
        className={twMerge(
          className,
          (isLoading || hasError) && "hidden",
          !isLoading && !hasError && "motion-safe:animate-mediaResolve",
        )}
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
