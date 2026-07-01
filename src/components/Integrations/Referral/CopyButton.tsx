"use client";

import cn from "classnames";
import { toast } from "react-toastify";
import CopyIcon from "icons/Copy.svg";

interface CopyButtonProps {
  value: string;
  // "icon" renders a bare copy glyph; "button" renders the primary "Copy Link" CTA.
  variant?: "icon" | "button";
  label?: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  variant = "button",
  label = "Copy Link",
  className,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Referral link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        className={cn(
          "text-secondaryText hover:text-orange transition-colors",
          className,
        )}
      >
        <CopyIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn("btn-primary px-6 py-2.5 text-sm", className)}
    >
      <CopyIcon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
};

export default CopyButton;
