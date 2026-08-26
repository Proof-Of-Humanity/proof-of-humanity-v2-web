import cn from "classnames";
import { ReactNode } from "react";
import Uploader from "components/Uploader";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline.svg";
import InfoIcon from "icons/info.svg";
import UploadIcon from "icons/upload.svg";

interface FileUploadZoneProps {
  onDrop: <T extends File>(acceptedFiles: T[]) => void;
  type: "all" | "video" | "image";
  fileName?: string | null;
  placeholder?: ReactNode;
  footnote?: ReactNode;
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
  footnoteIconClassName?: string;
}

function FileUploadZone({
  onDrop,
  type,
  fileName,
  placeholder = "Drag a file here, or click to select",
  footnote,
  disabled,
  className,
  iconClassName = "h-4 w-4",
  footnoteIconClassName,
}: FileUploadZoneProps) {
  const uploaded = !!fileName;

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <Uploader
        type={type}
        onDrop={onDrop}
        disabled={disabled}
        className={cn(
          "flex min-h-16 w-full items-center justify-center gap-2 rounded-btn border border-dashed px-4 py-3 text-sm transition-colors duration-200 ease-premium",
          uploaded
            ? "border-[#00D9A1] bg-white text-[#00A87E] dark:border-[#79FFDC] dark:bg-[#2F333D] dark:text-[#79FFDC]"
            : "border-[#FFB08A] bg-white text-[#E2703A] hover:bg-[#FFF7F0] dark:bg-[#292D35] dark:text-[#FFB08A] dark:hover:bg-[#2F333D]",
        )}
      >
        {uploaded ? (
          <>
            <CheckCircleOutlineIcon
              className={cn("shrink-0 fill-current", iconClassName)}
            />
            <span className="min-w-0 truncate">{fileName}</span>
          </>
        ) : (
          <>
            <UploadIcon
              className={cn("shrink-0 fill-current", iconClassName)}
            />
            <span>{placeholder}</span>
          </>
        )}
      </Uploader>
      {footnote && (
        <span className="text-secondaryText mt-2 flex items-center gap-1.5 text-xs">
          <InfoIcon
            className={cn(
              "h-3.5 w-3.5 shrink-0 stroke-current",
              footnoteIconClassName,
            )}
          />
          {footnote}
        </span>
      )}
    </div>
  );
}

export default FileUploadZone;
