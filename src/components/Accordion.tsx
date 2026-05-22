import { useState } from "react";
import cn from "classnames";
import MinusIcon from "icons/MinusMinor.svg";
import PlusIcon from "icons/PlusMinor.svg";

interface AccordionProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Accordion: React.FC<AccordionProps> = ({
  className,
  title,
  children,
  isOpen: propsIsOpen,
  onToggle: propsOnToggle,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = propsIsOpen !== undefined;

  const open = isControlled ? propsIsOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled && propsOnToggle) {
      propsOnToggle();
    } else {
      setInternalOpen((o) => !o);
    }
  };

  return (
    <div className={cn("text-primaryText flex flex-col", className)}>
      <div
        className="paper flex cursor-pointer items-center justify-between gap-4 p-5 font-bold transition duration-200 ease-premium"
        onClick={handleToggle}
      >
        <span className="min-w-0 flex-1 leading-snug">{title}</span>
        {open ? (
          <MinusIcon className="fill-orange h-4 w-4 shrink-0" />
        ) : (
          <PlusIcon className="fill-orange h-4 w-4 shrink-0" />
        )}
      </div>
      {open && children}
    </div>
  );
};

export default Accordion;
