"use client";

import { useState } from "react";

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
  const [videoFailed, setVideoFailed] = useState(false);
  const triggerElement =
    typeof trigger === "function" ? trigger(isOpen) : trigger;
  const shouldOpenVideoInNewTab =
    isVideo && openVideoInNewTabOnError && videoFailed;

  const openVideoInNewTab = () => {
    window.open(uri, "_blank", "noopener,noreferrer");
  };

  const handleOpen = () => {
    if (shouldOpenVideoInNewTab) {
      openVideoInNewTab();
      return;
    }

    setIsOpen(true);
  };

  const handleVideoError = () => {
    if (!isVideo || !openVideoInNewTabOnError) return;
    setIsOpen(false);
    setVideoFailed(true);
  };

  return (
    <>
      <span
        className="inline-flex"
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpen();
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
            <video
              className="max-h-[90vh] max-w-[90vw] rounded bg-black"
              src={uri}
              controls
              playsInline
              webkit-playsinline=""
              onClick={(event) => event.stopPropagation()}
              onEnded={() => setIsOpen(false)}
              onError={handleVideoError}
            />
          ) : (
            <img
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              src={uri}
              onClick={(event) => event.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
