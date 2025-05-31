import Popup from "reactjs-popup";
import { useEffect, useState } from "react";

interface PopoverInterface {
  trigger: JSX.Element;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const Popover: React.FC<PopoverInterface> = ({ trigger, children, className, open, onOpen, onClose }) => {
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
    <Popup 
      trigger={trigger} 
      position={position} 
      arrow={false}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
    >
      <div className={`bg-whiteBackground text-secondaryText shadow-shade-500/50 mt-1 rounded shadow-md ${className || 'w-48'}`}>
        {children}
      </div>
    </Popup>
  );
};

export default Popover;
