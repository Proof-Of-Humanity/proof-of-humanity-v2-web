import { Popup } from "reactjs-popup";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

const PopupComponent = Popup as ComponentType<any>;

type PopoverPosition = "bottom right" | "bottom left" | "bottom center";

interface PopoverInterface {
  trigger: JSX.Element;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  desktopPosition?: PopoverPosition;
}

const Popover: React.FC<PopoverInterface> = ({
  trigger,
  children,
  className,
  open,
  onOpen,
  onClose,
  desktopPosition = "bottom right",
}) => {
  const [position, setPosition] = useState<PopoverPosition>(desktopPosition);

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 768) {
        setPosition("bottom center");
      } else {
        setPosition(desktopPosition);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [desktopPosition]);

  return (
    <PopupComponent
      {...{
        trigger,
        position,
        arrow: false,
        open,
        onOpen,
        onClose,
      }}
    >
      <div
        className={`bg-whiteBackground text-secondaryText border-stroke mt-2 overflow-hidden rounded-2xl border shadow-soft ${className || "w-48"}`}
      >
        {children}
      </div>
    </PopupComponent>
  );
};

export default Popover;
