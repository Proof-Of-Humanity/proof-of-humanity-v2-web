import Field from "components/Field";
import FileUploadZone from "components/FileUploadZone";

interface EvidenceFormFieldsProps {
  title?: string;
  description: string;
  file: File | null;
  onTitleChange?: (value: string) => void;
  onTitleBlur?: () => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File) => void;
  disabled?: boolean;
  titlePlaceholder?: string;
  hideTitle?: boolean;
  titleError?: boolean;
}

export default function EvidenceFormFields({
  title = "",
  description,
  file,
  onTitleChange,
  onTitleBlur,
  onDescriptionChange,
  onFileChange,
  disabled,
  titlePlaceholder = "eg. The profile is legit.",
  hideTitle = false,
  titleError = false,
}: EvidenceFormFieldsProps) {
  return (
    <div className="mt-12 flex w-full flex-col gap-4">
      {!hideTitle && (
        <Field
          label="Title"
          labelClassName="!mb-2 !mt-0 text-sm !font-normal normal-case !text-secondaryText"
          placeholder={titlePlaceholder}
          value={title}
          onChange={(event) => onTitleChange?.(event.target.value)}
          onBlur={onTitleBlur}
          status={titleError ? "error" : undefined}
          message="A title is required"
          disabled={disabled}
        />
      )}
      <Field
        textarea
        label="Text"
        labelClassName="!mb-2 !mt-0 text-sm !font-normal normal-case !text-secondaryText"
        placeholder="Type your arguments here"
        className="min-h-[126px] resize-y"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        disabled={disabled}
      />
      <FileUploadZone
        type="all"
        fileName={file?.name}
        iconClassName="h-8 w-8"
        onDrop={(acceptedFiles) => {
          const acceptedFile = acceptedFiles[0];
          if (acceptedFile) onFileChange(acceptedFile);
        }}
        placeholder={<span className="sr-only">Upload a file</span>}
        footnote="Attach supporting file. It will be uploaded to IPFS and included with your evidence."
        footnoteIconClassName="text-status-claim"
        disabled={disabled}
      />
    </div>
  );
}
