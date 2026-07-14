import React from "react";
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

const buttonBaseClass = "disabled:cursor-not-allowed";

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
    const mergedButtonClasses = twMerge(
      buttonStyles[variant],
      buttonBaseClass,
      className,
    );

    const mergedWrapperClasses = twMerge(
      "relative group w-full md:w-fit",
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

    const button = (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={
          ariaLabel || (typeof label === "string" ? label : undefined)
        }
        className={mergedButtonClasses}
        disabled={disabled || isLoading}
      >
        {buttonContent}
      </button>
    );

    if (tooltip) {
      return (
        <div className={mergedWrapperClasses}>
          {button}
          <span className="tooltip-surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[240px] -translate-x-1/2 text-center text-sm opacity-0 transition-opacity group-hover:opacity-100">
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
