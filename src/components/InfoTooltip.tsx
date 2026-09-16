"use client";

import cn from "classnames";
import InfoIcon from "icons/info.svg";
import { useId, useState, type ReactNode } from "react";

interface InfoTooltipProps {
  /** Text rendered before the info icon; omit for an icon-only trigger. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "end";
  /** Where the bubble opens; pick the side that has room in your layout. */
  side?: "below" | "above";
}

export default function InfoTooltip({
  label,
  children,
  className,
  align = "center",
  side = "below",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      className={cn("inline-flex items-center gap-2 text-peach", className)}
    >
      {label && (
        <span className="whitespace-nowrap text-sm font-normal">{label}</span>
      )}
      <span
        className="relative z-20 inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <button
          type="button"
          className="inline-flex text-peach"
          aria-label={open ? undefined : "More information"}
          aria-expanded={open}
          aria-describedby={open ? tooltipId : undefined}
          onFocus={show}
          onBlur={hide}
          // Open only (never toggle): a tap fires mouseenter→click, so toggling
          // would immediately re-close what the hover just opened.
          onClick={show}
        >
          <InfoIcon className="h-4 w-4 shrink-0 stroke-current stroke-2" />
        </button>
        <span
          id={tooltipId}
          role="tooltip"
          aria-hidden={!open}
          className={cn(
            "border-stroke bg-grey text-primaryText pointer-events-none absolute z-50 w-max max-w-[min(232px,calc(100vw-2rem))] rounded-input border p-4 text-center text-sm font-normal leading-[normal] shadow-soft transition-opacity",
            side === "below" ? "top-full mt-2" : "bottom-full mb-2",
            // End-aligned bubbles hang from the icon. On phones `end` still
            // opens to the right so a left-edge trigger is not clipped.
            align === "end"
              ? "left-0 sm:left-auto sm:right-0"
              : "left-1/2 -translate-x-1/2",
            open ? "visible opacity-100" : "invisible opacity-0",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "border-stroke bg-grey absolute h-3 w-3 rotate-45",
              side === "below"
                ? "-top-[7px] border-l border-t"
                : "-bottom-[7px] border-b border-r",
              align === "end"
                ? "left-[2px] sm:left-auto sm:right-[2px]"
                : "left-1/2 -translate-x-1/2",
            )}
          />
          <span className="relative flex flex-col gap-4">{children}</span>
        </span>
      </span>
    </span>
  );
}
