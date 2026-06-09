import React from "react";

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
      className={`bg-whiteBackgroundWithOpacity text-primaryText placeholder:text-secondaryText min-h-[44px] w-full rounded-sm border px-4 py-2 text-center text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-0 ${
        isInvalid
          ? "border-red-500 focus:border-red-600"
          : "border-stroke focus:border-stroke"
      }`}
    />

    {isInvalid && (
      <p className="mt-2 text-sm text-red-500">Please enter a valid email</p>
    )}
  </>
);

export default EmailField;
