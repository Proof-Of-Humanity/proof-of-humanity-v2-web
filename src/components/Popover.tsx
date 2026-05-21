import { Popup } from "reactjs-popup";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

const PopupComponent = Popup as ComponentType<any>;

interface PopoverInterface {
  trigger: JSX.Element;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const Popover: React.FC<PopoverInterface> = ({
  trigger,
  children,
  className,
  open,
  onOpen,
  onClose,
}) => {
  const [position, setPosition] = useState<"bottom right" | "bottom center">(
    "bottom right",
  );

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 768) {
        setPosition("bottom center");
      } else {
        setPosition("bottom right");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

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
