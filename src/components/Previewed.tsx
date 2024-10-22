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
        <>
          <div className="backdrop" onClick={close}>
            {!isVideo && (
              <div
                className="relative min-h-screen w-full bg-auto bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${uri})` }}
              />
            )}
          </div>
          {isVideo && (
            <video
              className="absolute-centered fixed z-30 max-h-screen rounded"
              src={uri}
              controls
              onEnded={close}
            />
          )}
        </>
      )}
    </Popup>
  );
}
