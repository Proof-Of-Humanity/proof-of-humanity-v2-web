import React from "react";
import { useDropzone } from "react-dropzone";
import { MEDIA_UPLOAD_ACCEPT } from "utils/media";

interface UploaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  onDrop: <T extends File>(acceptedFiles: T[]) => void;
  type: "all" | "video" | "image";
  disabled?: boolean;
}

const Uploader: React.FC<UploaderProps> = ({
  onDrop,
  type,
  children,
  disabled,
  ...props
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: type !== "all" ? MEDIA_UPLOAD_ACCEPT[type] : undefined,
  });

  return (
    <div className="flex cursor-pointer flex-col">
      <div {...props} {...getRootProps()}>
        <input {...getInputProps()} />
        {children}
      </div>
    </div>
  );
};

export default Uploader;
