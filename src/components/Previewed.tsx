"use client";

import Popup from "reactjs-popup";

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
  return (
    <Popup trigger={trigger} modal nested>
      {(close) => (
        <div
          className="backdrop fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={close}
        >
          {isVideo ? (
            <video
              className="max-h-[90vh] max-w-[90vw] rounded bg-black"
              src={uri}
              controls
              playsInline
              webkit-playsinline=""
              onClick={(event) => event.stopPropagation()}
              onEnded={close}
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
    </Popup>
  );
}
