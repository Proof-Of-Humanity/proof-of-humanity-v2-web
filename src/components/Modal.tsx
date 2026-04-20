"use client";

import cn from "classnames";
import { useEffect, useState } from "react";
import Popup from "reactjs-popup";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  canClose?: boolean;
  className?: string;
  formal?: boolean;
  header?: string;
}

const ANIMATION_MS = 260;

const Modal: React.FC<ModalProps> = ({
  formal,
  header,
  className,
  children,
  open,
  onClose,
  canClose = true,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      let firstFrame = 0;
      let secondFrame = 0;

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => {
      setIsRendered(false);
    }, ANIMATION_MS);

    return () => window.clearTimeout(timeout);
  }, [open]);

  const handleCloseRequest = () => {
    if (!canClose) return;
    onClose();
  };

  if (!isRendered) return null;

  return (
    <Popup
      modal
      open={isRendered}
      closeOnEscape={false}
      closeOnDocumentClick={false}
      onClose={handleCloseRequest}
    >
      {() => (
        <>
          <div
            className={cn("backdrop modal-backdrop", {
              "modal-backdrop-open": isVisible,
            })}
            onClick={handleCloseRequest}
          />
          <div
            className={cn(
              "modal-shell fixed left-1/2 top-1/2 z-30 w-4/5 md:w-3/5 xl:w-2/5",
              {
                "bg-whiteBackground border-stroke overflow-clip rounded border":
                  formal,
                "modal-shell-open": isVisible,
              },
              className,
            )}
          >
            {header && (
              <div className="gradient py-2 text-center font-semibold uppercase text-white">
                {header}
              </div>
            )}
            {children}
          </div>
        </>
      )}
    </Popup>
  );
};

export default Modal;
