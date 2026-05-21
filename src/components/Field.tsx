import cn from "classnames";
import {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  useState,
} from "react";
import Label from "./Label";

type FieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  InputHTMLAttributes<HTMLInputElement> & {
    textarea?: boolean;
    label?: ReactNode;
  };

function Field({ label, textarea = false, className, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex w-full flex-col">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "bg-whiteBackground border-stroke w-full overflow-hidden rounded-input border shadow-inset transition duration-200 ease-premium",
          focused ? "border-orange" : "",
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
