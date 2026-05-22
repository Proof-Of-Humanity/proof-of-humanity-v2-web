"use client";

import { twMerge } from "tailwind-merge";
import { useState } from "react";

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export default function VideoThumbnail({
  src,
  className,
}: VideoThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Append #t=0.001 to force iOS Safari to render first frame
  const videoSrc = src.includes("#") ? src : `${src}#t=0.001`;

  return (
    <div
      className={twMerge(
        "relative aspect-video w-full overflow-hidden",
        className,
      )}
    >
      {isLoading && !hasError ? (
        <div className="bg-grey absolute inset-0 animate-pulse" />
      ) : null}
      {hasError ? (
        <div className="bg-grey text-secondaryText absolute inset-0 flex items-center justify-center p-4 text-center text-sm">
          Video unavailable
        </div>
      ) : null}
      <video
        className={twMerge(
          "h-full w-full bg-black object-contain",
          (isLoading || hasError) && "hidden",
        )}
        src={videoSrc}
        preload="metadata"
        playsInline
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
