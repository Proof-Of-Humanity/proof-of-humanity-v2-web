"use client";

import cn from "classnames";
import InfoIcon from "icons/info.svg";
import { useId, useState, type ReactNode } from "react";

interface InfoTooltipProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "end";
}

export default function InfoTooltip({
  label,
  children,
  className,
  align = "center",
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
          "border-stroke bg-grey text-primaryText pointer-events-none absolute top-full z-50 mt-2 w-[min(232px,calc(100vw-2rem))] rounded-input border p-4 text-center text-sm font-normal leading-[normal] shadow-soft transition-opacity",
          align === "end"
            ? "right-0"
            : "left-[calc(100%-0.5rem)] -translate-x-1/2",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "border-stroke bg-grey absolute -top-[5px] h-2.5 w-2.5 rotate-45 border-l border-t",
            align === "end" ? "right-2" : "left-1/2 -translate-x-1/2",
          )}
        />
        <span className="relative flex flex-col gap-4">{children}</span>
      </span>
    </span>
  );
}
