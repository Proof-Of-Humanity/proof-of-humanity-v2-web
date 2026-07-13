import cn from "classnames";
import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import Label from "./Label";

type FieldStatus = "error";

type FieldCommonProps = {
  label?: ReactNode;
  status?: FieldStatus;
  message?: ReactNode;
};

type FieldProps =
  | (InputHTMLAttributes<HTMLInputElement> &
      FieldCommonProps & { textarea?: false })
  | (TextareaHTMLAttributes<HTMLTextAreaElement> &
      FieldCommonProps & { textarea: true });

const statusControl: Record<FieldStatus, string> = {
  error: "flat-control-error",
};

const statusMessage: Record<FieldStatus, string> = {
  error: "text-status-rejected",
};

function Field({
  label,
  textarea = false,
  status,
  message,
  className,
  ...props
}: FieldProps) {
  return (
    <div className="flex w-full flex-col">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "flat-control w-full overflow-hidden rounded-input transition duration-200 ease-premium",
          status && statusControl[status],
          !textarea && "min-h-12",
        )}
      >
        {textarea ? (
          <textarea
            className={cn(
              "text-primaryText block w-full border-none bg-transparent px-4 py-3 font-medium transition ease-in-out",
              "focus:ring-0",
              className,
            )}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={cn(
              "text-primaryText block min-h-12 w-full border-none bg-transparent px-4 py-3 font-medium",
              "focus:ring-0 focus-visible:outline-none",
              className,
            )}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {status && message && (
        <span className={cn("mt-1.5 text-xs", statusMessage[status])}>
          {message}
        </span>
      )}
    </div>
  );
}

export default Field;
