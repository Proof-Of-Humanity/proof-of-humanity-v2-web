import React from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

export type ActionButtonVariant = 'primary' | 'secondary';

export interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
  variant?: ActionButtonVariant;
  tooltip?: string;
}

const buttonStyles = {
  primary:
    'flex items-center justify-center gradient rounded-sm font-medium text-white',
  secondary:
    'flex items-center justify-center border-2 border-theme text-orange rounded-sm font-semibold',
};

const buttonBaseClass =
  'normal-case disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2';

export default function ActionButton({
  onClick,
  label,
  disabled = false,
  isLoading = false,
  ariaLabel,
  className = '',
  variant = 'primary',
  tooltip,
}: ActionButtonProps) {

  const mergedButtonClasses = twMerge(
    buttonStyles[variant],
    buttonBaseClass
  );

  const mergedWrapperClasses = twMerge("relative group w-fit", className);

  const buttonContent = (
    <>
      {isLoading && (
        <Image
          alt="loading"
          src="/logo/poh-white.svg"
          className="animate-flip fill-white mr-2"
          width={14}
          height={14}
        />
      )}
      {label}
    </>
  );

  const button = (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={tooltip ? mergedButtonClasses : twMerge(mergedButtonClasses, className)}
      disabled={disabled || isLoading}
    >
      {buttonContent}
    </button>
  );

  if (tooltip) {
    return (
      <div className={mergedWrapperClasses}>
        {button}
        <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white transition-opacity pointer-events-none">
          {tooltip}
          <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-neutral-700" />
        </span>
      </div>
    );
  }

  return button;
}