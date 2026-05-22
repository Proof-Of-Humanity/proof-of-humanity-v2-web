import cn from "classnames";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import Label from "./Label";

type FieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  InputHTMLAttributes<HTMLInputElement> & {
    textarea?: boolean;
    label?: string;
  };

function Field({ label, textarea = false, className, ...props }: FieldProps) {
  return (
    <div className="flex w-full flex-col">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "focus-within:border-orange w-full overflow-hidden rounded-input border border-[rgba(255,255,255,0.08)] bg-[#17141F] transition duration-200 ease-premium",
        )}
      >
        {textarea ? (
          <textarea
            className={cn(
              "text-primaryText block w-full border-none bg-transparent px-4 py-2.5 font-medium transition ease-in-out",
              "focus:ring-0",
              className,
            )}
            {...props}
          />
        ) : (
          <input
            className={cn(
              "text-primaryText block w-full border-none bg-transparent px-4 py-2.5 font-medium",
              "focus:ring-0 focus-visible:outline-none",
              className,
            )}
            {...props}
          />
        )}
      </div>
    </div>
  );
}

export default Field;
