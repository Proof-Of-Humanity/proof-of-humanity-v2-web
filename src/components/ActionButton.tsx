import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
  icon?: React.ReactNode;
  defaultLabel?: string;
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
  defaultLabel,
  tooltip,
  tooltipPosition = 'top',
}: ActionButtonProps) {
  const buttonStyle = (defaultLabel && label !== defaultLabel) 
    ? 'btn-sec' 
    : 'btn-main gradient';

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeoutId, setTooltipTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (tooltip) {
      const timeoutId = setTimeout(() => {
        setShowTooltip(true);
      }, 300);
      setTooltipTimeoutId(timeoutId);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
      setTooltipTimeoutId(null);
    }
    setShowTooltip(false);
  };

  const getTooltipPositionStyles = () => {
    switch (tooltipPosition) {
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' };
      case 'left':
        return { top: '50%', right: '100%', transform: 'translateY(-50%) translateX(-8px)' };
      case 'right':
        return { top: '50%', left: '100%', transform: 'translateY(-50%) translateX(8px)' };
      default:
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' };
    }
  };
  const buttonBaseClass = 'px-5 py-2 normal-case disabled:opacity-50 disabled:cursor-not-allowed flex items-center';

  const mergedClasses = twMerge(buttonStyle, buttonBaseClass, className);
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={onClick}
        aria-label={ariaLabel || label}
        tabIndex={0}
        className={mergedClasses}
        disabled={disabled || isLoading}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
      >
        {isLoading && (
          <span className="mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
        )}
        
        {icon && !isLoading && (
          <span className="mr-2">{icon}</span>
        )}
        
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