import React, { useState, useRef, useEffect } from 'react';
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
  icon?: React.ReactNode;
  variant?: ActionButtonVariant;
  tooltip?: React.ReactNode;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export default function ActionButton({
  onClick,
  label,
  disabled = false,
  isLoading = false,
  ariaLabel,
  className = '',
  icon,
  variant = 'primary',
  tooltip,
  tooltipPosition = 'top',
}: ActionButtonProps) {
  const buttonStyle = variant === 'secondary' ? 'btn-sec' : 'btn-main';

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (tooltip) {
      tooltipTimeoutId.current = setTimeout(() => {
        setShowTooltip(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutId.current) {
      clearTimeout(tooltipTimeoutId.current);
      tooltipTimeoutId.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutId.current) {
        clearTimeout(tooltipTimeoutId.current);
      }
    };
  }, []);

  const getTooltipPositionStyles = () => {
    switch (tooltipPosition) {
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' };
      case 'left':
        return { top: '50%', right: '100%', transform: 'translateY(-50%) translateX(-8px)' };
      case 'right':
        return { top: '50%', left: '100%', transform: 'translateY(-50%) translateX(8px)' };
      default: // top
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' };
    }
  };

  const buttonBaseClass =
    'w-full normal-case disabled:opacity-50 disabled:cursor-not-allowed';

  const mergedClasses = twMerge(buttonStyle, buttonBaseClass, className);
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={onClick}
        aria-label={ariaLabel || label}
        className={mergedClasses}
        disabled={disabled || isLoading}
      >
        {isLoading && (
          <Image
            alt="loading"
            src="/logo/poh-white.svg"
            className="animate-flip fill-white mr-2"
            width={14}
            height={14}
          />
        )}

        {icon && !isLoading && <span className="mr-2">{icon}</span>}

        {label}
      </button>
      {tooltip && showTooltip && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...getTooltipPositionStyles(),
            backgroundColor: 'black',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            zIndex: 50,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
} 