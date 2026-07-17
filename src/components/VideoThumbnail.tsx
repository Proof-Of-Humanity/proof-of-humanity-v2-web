"use client";

import { twMerge } from "tailwind-merge";
import { useState } from "react";
import MediaFallback from "./MediaFallback";

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export default function VideoThumbnail({
  src,
  className,
}: VideoThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Append #t=0.001 to force iOS Safari to render first frame
  const videoSrc = src.includes("#") ? src : `${src}#t=0.001`;

  return (
    <div
      className={twMerge(
        "relative aspect-video w-full overflow-hidden",
        className,
      )}
    >
      {hasError ? (
        <MediaFallback
          error
          label="Video unavailable"
          className="absolute inset-0"
        />
      ) : isLoading ? (
        <MediaFallback className="absolute inset-0" />
      ) : null}
      <video
        className={twMerge(
          "h-full w-full bg-black object-contain",
          (hasError || isLoading) && "invisible",
          !hasError && !isLoading && "motion-safe:animate-mediaResolve",
        )}
        src={videoSrc}
        preload="metadata"
        playsInline
        onLoadedData={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
