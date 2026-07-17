"use client";

import cn from "classnames";
import InfoIcon from "icons/info.svg";
import { useId, useState, type ReactNode } from "react";

interface InfoTooltipProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function InfoTooltip({
  label,
  children,
  className,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-normal text-peach"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={show}
        onBlur={hide}
        // Open only (never toggle): a tap fires mouseenter→click, so toggling
        // would immediately re-close what the hover just opened.
        onClick={show}
      >
        <span>{label}</span>
        <InfoIcon className="h-4 w-4 shrink-0 stroke-current stroke-2" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          "border-stroke bg-grey text-primaryText pointer-events-none absolute left-[calc(100%-0.5rem)] top-full z-50 mt-2 w-[min(232px,calc(100vw-2rem))] -translate-x-1/2 rounded-input border p-4 text-center text-sm font-normal leading-[normal] shadow-soft transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        <span
          aria-hidden
          className="border-stroke bg-grey absolute -top-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t"
        />
        <span className="relative flex flex-col gap-4">{children}</span>
      </span>
    </span>
  );
}
