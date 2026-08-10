"use client";

import { useId, useState } from "react";
import Popover from "components/Popover";
import CaretDownIcon from "icons/CaretDown.svg";
import cn from "classnames";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
  active?: boolean;
  onClear?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  children,
  active = false,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [menuMinWidth, setMenuMinWidth] = useState<number>();
  // reactjs-popup clones the trigger, so measure/focus by id rather than a ref
  const triggerId = useId();

  const closeAndRefocus = () => {
    setOpen(false);
    setTimeout(() => document.getElementById(triggerId)?.focus(), 0);
  };

  return (
    <Popover
      open={open}
      desktopPosition="bottom left"
      onOpen={() => {
        setOpen(true);
        setMenuMinWidth(document.getElementById(triggerId)?.offsetWidth);
      }}
      onClose={() => setOpen(false)}
      className="w-max min-w-48"
      trigger={
        <button
          id={triggerId}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "bg-whiteBackground text-primaryText hover:bg-grey flex min-h-12 w-full items-center justify-between rounded-btn border px-4 transition duration-200 ease-premium sm:w-64",
            active ? "border-peach" : "border-stroke",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left text-sm">
            {title}
          </span>
          {active && onClear && (
            <>
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear filter"
                className="hover:text-orange ml-2 flex h-6 w-6 shrink-0 items-center justify-center text-lg leading-none text-peach transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  e.stopPropagation();
                  onClear();
                }}
              >
                &times;
              </span>
              <span className="bg-stroke mx-1 h-4 w-px shrink-0" />
            </>
          )}
          <CaretDownIcon
            className={cn(
              "ml-2 h-3 w-3 shrink-0 fill-current text-peach transition-transform duration-200 ease-premium",
              open && "rotate-180",
            )}
          />
        </button>
      }
    >
      <div
        role="menu"
        style={{ minWidth: menuMinWidth }}
        className="bg-whiteBackground text-primaryText border-stroke flex origin-top animate-dropdownIn flex-col overflow-hidden rounded-2xl border py-2 shadow-soft"
        onClick={closeAndRefocus}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closeAndRefocus();
            return;
          }
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
          );
          const index = items.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          const step = e.key === "ArrowDown" ? 1 : -1;
          items[(index + step + items.length) % items.length]?.focus();
        }}
      >
        {children}
      </div>
    </Popover>
  );
};

export default Dropdown;
