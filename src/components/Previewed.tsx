"use client";

import { useState } from "react";

interface ImageProps {
  uri: string;
  isVideo?: boolean;
  trigger: JSX.Element | ((isOpen: boolean) => JSX.Element);
}

export default function Previewed({
  uri,
  trigger,
  isVideo = false,
}: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerElement =
    typeof trigger === "function" ? trigger(isOpen) : trigger;

  return (
    <>
      <span
        className="inline-flex"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
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
