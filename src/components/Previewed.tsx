"use client";

import { useState } from "react";
import LoadableImage from "./LoadableImage";
import MediaFallback from "./MediaFallback";

type PreviewedProps = {
  /** Element that opens the fullscreen preview when activated. */
  trigger: JSX.Element;
  uri: string;
} & ({ kind: "image" } | { kind: "video"; openInNewTabOnError?: boolean });

export default function Previewed(props: PreviewedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

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
        {props.trigger}
      </span>
      {isOpen && (
        <div
          className="backdrop fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={close}
        >
          {props.kind === "video" ? (
            <PreviewVideo
              uri={props.uri}
              openInNewTabOnError={props.openInNewTabOnError ?? false}
              close={close}
            />
          ) : (
            <div onClick={(event) => event.stopPropagation()}>
              <LoadableImage
                alt="Preview"
                className="max-h-[90vh] max-w-[90vw] object-contain"
                src={props.uri}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PreviewVideo({
  uri,
  openInNewTabOnError,
  close,
}: {
  uri: string;
  openInNewTabOnError: boolean;
  close: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded bg-black"
      onClick={(event) => event.stopPropagation()}
    >
      {isLoading && !hasError ? (
        <MediaFallback className="aspect-video w-[min(90vw,900px)]" />
      ) : null}
      {hasError ? (
        <div className="flex aspect-video w-[min(90vw,900px)] flex-col items-center justify-center gap-3">
          <MediaFallback
            error
            label="Video unavailable"
            className="w-full flex-1"
          />
          {/* An async media error is not a user gesture: auto window.open gets
              popup-blocked. A real link keeps the escape hatch reliable. */}
          {openInNewTabOnError && (
            <a
              href={uri}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              onClick={close}
            >
              Open video in new tab
            </a>
          )}
        </div>
      ) : null}
      <video
        className={`max-h-[90vh] max-w-[90vw] rounded bg-black ${
          isLoading || hasError ? "hidden" : ""
        }`}
        src={uri}
        controls
        playsInline
        webkit-playsinline=""
        onLoadedData={() => setIsLoading(false)}
        onError={handleError}
        onEnded={close}
      />
    </div>
  );
}
