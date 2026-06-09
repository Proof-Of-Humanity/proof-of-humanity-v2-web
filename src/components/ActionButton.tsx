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
  primary:
    "flex items-center justify-center gradient rounded-sm font-medium text-white",
  secondary:
    "flex items-center justify-center border-2 border-theme text-orange rounded-sm font-semibold",
};

const buttonBaseClass =
  "w-full md:w-auto normal-case disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2";

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
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            {tooltip}
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          </span>
        </div>
      );
    }

    return button;
  },
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
