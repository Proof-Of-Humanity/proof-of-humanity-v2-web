"use client";

import cn from "classnames";
import InfoIcon from "icons/info.svg";
import { useState, type ReactNode } from "react";

interface InfoTooltipProps {
  label: ReactNode;
  children: ReactNode;
  align?: "center" | "right";
  className?: string;
}

export default function InfoTooltip({
  label,
  children,
  align = "center",
  className,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("group/info relative inline-flex", className)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-normal text-peach"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <InfoIcon className="h-4 w-4 shrink-0 stroke-current stroke-2" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "border-stroke bg-grey text-primaryText pointer-events-none absolute top-full z-50 mt-2 w-[min(232px,calc(100vw-2rem))] rounded-input border p-4 text-center text-sm font-normal leading-[normal] opacity-0 shadow-soft transition-opacity group-focus-within/info:opacity-100 group-hover/info:opacity-100",
          open && "opacity-100",
          align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "right-0 translate-x-0",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "border-stroke bg-grey absolute -top-[5px] h-2.5 w-2.5 rotate-45 border-l border-t",
            align === "center" ? "left-1/2 -translate-x-1/2" : "right-3",
          )}
        />
        <span className="relative flex flex-col gap-4">{children}</span>
      </span>
    </span>
  );
}
