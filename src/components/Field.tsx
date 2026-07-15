import cn from "classnames";
import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import CloseCircleOutlineIcon from "icons/CloseCircleOutline.svg";
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
          !textarea && "flex min-h-12 items-center",
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
          <>
            <input
              className={cn(
                "text-primaryText min-h-12 min-w-0 flex-1 border-none bg-transparent px-4 py-3 font-medium",
                "focus:ring-0 focus-visible:outline-none",
                className,
              )}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
            {status === "error" && (
              <CloseCircleOutlineIcon
                aria-hidden
                className="text-status-rejected mr-4 h-4 w-4 shrink-0 fill-current"
              />
            )}
          </>
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
