import cn from "classnames";
import { InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import Label from "./Label";

type FieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  InputHTMLAttributes<HTMLInputElement> & {
    textarea?: boolean;
    label?: string;
  };

function Field({ label, textarea = false, className, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex w-full flex-col">
      {label && <Label>{label}</Label>}
      <div
        className={cn("bordered w-full", {
          "ring-theme/60 ring-2 ring-offset-2": focused,
        })}
      >
        {textarea ? (
          <textarea
            className={cn(
              "bg-whiteBackgroundWithOpacity text-primaryText block w-full rounded-sm border-none px-4 py-2 font-medium bg-blend-lighten transition ease-in-out",
              "focus:ring-0",
              className,
            )}
            {...props}
          />
        ) : (
          <input
            className={cn(
              "bg-whiteBackgroundWithOpacity text-primaryText block w-full rounded-sm border-none px-4 py-2 font-medium bg-blend-overlay",
              "focus-visible:outline-none",
              className,
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        )}
      </div>
    </div>
  );
}

export default Field;
