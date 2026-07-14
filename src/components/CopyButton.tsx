"use client";

import cn from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import CheckIcon from "icons/CheckCircleOutline.svg";
import CopyIcon from "icons/Copy.svg";

const COPIED_RESET_MS = 2000;

export default function CopyButton({
  value,
  label = "Copy POH ID",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = useCallback(async () => {
    try {
      // `navigator.clipboard` is undefined in insecure/unsupported contexts;
      // optional chaining avoids a synchronous throw, and try/catch handles a
      // rejected write.
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard access can fail (permissions, insecure origin) — ignore.
    }
  }, [value]);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        aria-label={copied ? "Copied" : label}
        className={cn(
          "relative inline-flex h-4 w-4 items-center justify-center transition-colors duration-200 ease-out",
          copied ? "text-orange" : "text-peach hover:opacity-70",
        )}
        onClick={handleCopy}
        title={label}
        type="button"
      >
        <CopyIcon
          className={cn(
            "absolute h-4 w-4 transition-all duration-200 ease-out",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <CheckIcon
          className={cn(
            "absolute h-4 w-4 transition-all duration-200 ease-out",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </button>
      <span
        className={cn(
          "tooltip-surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 text-center text-sm transition-all duration-200 ease-out",
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        Copied
      </span>
    </span>
  );
}
