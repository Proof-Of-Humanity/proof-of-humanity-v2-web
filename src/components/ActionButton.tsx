import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function ActionButton({
  onClick,
  label,
  disabled = false,
  isLoading = false,
  ariaLabel,
  className = '',
  icon
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      tabIndex={0}
      className={`btn-main gradient px-5 py-2 normal-case disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${className}`}
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
  );
} 