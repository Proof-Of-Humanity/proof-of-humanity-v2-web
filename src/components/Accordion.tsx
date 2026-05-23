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
      <button
        type="button"
        aria-expanded={open}
        className="hover:border-orange flex min-h-[62px] w-full cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-[#3A3E48] bg-[#292D35] px-5 py-4 text-left font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ease-premium"
        onClick={handleToggle}
      >
        <span className="min-w-0 flex-1 leading-snug">{title}</span>
        <span className="bg-orange flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          {open ? (
            <MinusIcon className="h-4 w-4 fill-[#1E2129]" />
          ) : (
            <PlusIcon className="h-4 w-4 fill-[#1E2129]" />
          )}
        </span>
      </button>
      {open && <div className="mt-2.5 flex flex-col">{children}</div>}
    </div>
  );
};

export default Accordion;
