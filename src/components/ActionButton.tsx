import React, { useId, useState } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export type ActionButtonVariant = "primary" | "secondary";

export interface ActionButtonProps {
  onClick: () => void;
  label: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
  variant?: ActionButtonVariant;
  tooltip?: string;
  /** Make the tooltip wrapper span the full width so a `w-full` button isn't
   * collapsed to content width by the default `md:w-fit` wrapper. */
  fullWidth?: boolean;
}

const buttonStyles = {
  primary: "btn-primary",
  secondary: "btn-secondary",
};

const buttonBaseClass =
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-40";

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      onClick,
      label,
      disabled = false,
      isLoading = false,
      ariaLabel,
      className = "",
      variant = "primary",
      tooltip,
      fullWidth = false,
    },
    ref,
  ) => {
    const tooltipId = useId();
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const isDisabled = disabled || isLoading;

    const mergedButtonClasses = twMerge(
      buttonStyles[variant],
      buttonBaseClass,
      className,
    );

    const mergedWrapperClasses = twMerge(
      "relative flex w-full justify-center md:w-fit",
      fullWidth && "md:w-full",
    );

    const buttonContent = (
      <>
        {isLoading && (
          <Image
            alt="loading"
            src="/logo/poh-white.svg"
            className="mr-2 animate-flip fill-white"
            width={14}
            height={14}
          />
        )}
        {label}
      </>
    );

    // When the button has a tooltip it stays focusable while unavailable
    // (`aria-disabled` + click guard instead of the native `disabled`
    // attribute), so keyboard and screen-reader users can reach the
    // explanation of why the action is unavailable.
    const button = (
      <button
        ref={ref}
        onClick={() => {
          if (isDisabled) return;
          onClick();
        }}
        aria-label={
          ariaLabel || (typeof label === "string" ? label : undefined)
        }
        aria-describedby={tooltip ? tooltipId : undefined}
        aria-disabled={tooltip ? isDisabled : undefined}
        disabled={tooltip ? undefined : isDisabled}
        className={mergedButtonClasses}
      >
        {buttonContent}
      </button>
    );

    if (tooltip) {
      return (
        <div
          className={mergedWrapperClasses}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          onFocus={() => setTooltipVisible(true)}
          onBlur={() => setTooltipVisible(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setTooltipVisible(false);
          }}
        >
          {button}
          <span
            id={tooltipId}
            role="tooltip"
            className={twMerge(
              "tooltip-surface pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 text-center text-sm transition-opacity",
              tooltipVisible ? "opacity-100" : "opacity-0",
            )}
          >
            {tooltip}
          </span>
        </div>
      );
    }

    return button;
  },
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
