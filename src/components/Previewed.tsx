"use client";

import { useState } from "react";
import LoadableImage from "./LoadableImage";

interface ImageProps {
  uri: string;
  isVideo?: boolean;
  openVideoInNewTabOnError?: boolean;
  trigger: JSX.Element | ((isOpen: boolean) => JSX.Element);
}

export default function Previewed({
  uri,
  trigger,
  isVideo = false,
  openVideoInNewTabOnError = false,
}: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const triggerElement =
    typeof trigger === "function" ? trigger(isOpen) : trigger;
  const openPreview = () => {
    setIsVideoLoading(true);
    setHasVideoError(false);
    setIsOpen(true);
  };

  return (
    <>
      <span
        className="inline-flex"
        role="button"
        tabIndex={0}
        onClick={openPreview}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPreview();
          }
        }}
        onErrorCapture={handleVideoError}
      >
        {triggerElement}
      </span>
      {isOpen && (
        <div
          className="backdrop fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {isVideo ? (
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded bg-black"
              onClick={(event) => event.stopPropagation()}
            >
              {isVideoLoading && !hasVideoError ? (
                <div className="bg-grey flex aspect-video w-[min(90vw,900px)] animate-pulse items-center justify-center" />
              ) : null}
              {hasVideoError ? (
                <div className="bg-grey text-secondaryText flex aspect-video w-[min(90vw,900px)] items-center justify-center p-4 text-center text-sm">
                  Video unavailable
                </div>
              ) : null}
              <video
                className={`max-h-[90vh] max-w-[90vw] rounded bg-black ${
                  isVideoLoading || hasVideoError ? "hidden" : ""
                }`}
                src={uri}
                controls
                playsInline
                webkit-playsinline=""
                onLoadedData={() => setIsVideoLoading(false)}
                onError={() => {
                  setIsVideoLoading(false);
                  setHasVideoError(true);
                }}
                onEnded={() => setIsOpen(false)}
              />
            </div>
          ) : (
            <div onClick={(event) => event.stopPropagation()}>
              <LoadableImage
                alt="Preview"
                className="max-h-[90vh] max-w-[90vw] object-contain"
                fallbackLabel="Image unavailable"
                src={uri}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
