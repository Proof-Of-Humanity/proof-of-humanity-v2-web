import React from "react";
import cn from "classnames";

interface EmailFieldProps {
  value: string;
  /** Whether to show the invalid-email styling and message. */
  isInvalid: boolean;
  autoFocus: boolean;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({
  value,
  isInvalid,
  autoFocus,
  onChange,
  onKeyDown,
}) => (
  <>
    <input
      type="email"
      value={value}
      onKeyDown={onKeyDown}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Email"
      autoFocus={autoFocus}
      className={cn(
        "flat-control text-primaryText placeholder:text-secondaryText min-h-12 w-full rounded-input px-4 py-2 text-center text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-0",
        isInvalid && "flat-control-error",
      )}
    />

    {isInvalid && (
      <p className="text-status-rejected mt-2 text-xs">
        Please enter a valid email
      </p>
    )}
  </>
);

export default EmailField;
