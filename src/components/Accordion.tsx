import { useState } from "react";
import cn from "classnames";
import MinusIcon from "icons/MinusMinor.svg";
import PlusIcon from "icons/PlusMinor.svg";

interface AccordionProps {
  className?: string;
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  className,
  title,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col text-black", className)}>
      <div
        className="paper flex cursor-pointer justify-between overflow-hidden p-4 font-bold"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        {open ? (
          <MinusIcon className="h-4 w-4 fill-black" />
        ) : (
          <PlusIcon className="h-4 w-4 fill-black" />
        )}
      </div>
      {open && children}
    </div>
  );
};

export default Accordion;
