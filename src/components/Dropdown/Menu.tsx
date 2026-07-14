"use client";

import { useState } from "react";
import Popover from "components/Popover";
import CaretDownIcon from "icons/CaretDown.svg";
import cn from "classnames";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      trigger={
        <button className="bg-whiteBackground border-stroke text-primaryText flex min-h-12 w-full items-center justify-between rounded-btn border px-4 transition duration-200 ease-premium hover:bg-grey sm:w-64">
          <span className="min-w-0 flex-1 truncate text-left text-sm">{title}</span>
          <CaretDownIcon
            className={cn(
              "text-peach ml-2 h-3 w-3 shrink-0 fill-current transition-transform duration-200 ease-premium",
              open && "rotate-180",
            )}
          />
        </button>
      }
    >
      <div className="bg-whiteBackground text-primaryText border-stroke flex flex-col overflow-hidden rounded-2xl border shadow-soft">
        {children}
      </div>
    </Popover>
  );
};

export default Dropdown;
