import Field from "components/Field";
import FileUploadZone from "components/FileUploadZone";

interface EvidenceTitleFieldProps {
  title: string;
  onTitleChange: (value: string) => void;
  onTitleBlur?: () => void;
  disabled?: boolean;
  titleError?: boolean;
}

export function EvidenceTitleField({
  title,
  onTitleChange,
  onTitleBlur,
  disabled,
  titleError = false,
}: EvidenceTitleFieldProps) {
  return (
    <Field
      label="Title"
      labelClassName="!mb-2 !mt-0 text-sm !font-normal normal-case !text-secondaryText"
      placeholder="eg. The profile is legit."
      value={title}
      onChange={(event) => onTitleChange(event.target.value)}
      onBlur={onTitleBlur}
      status={titleError ? "error" : undefined}
      message="A title is required"
      disabled={disabled}
    />
  );
}

interface EvidenceFormFieldsProps {
  description: string;
  file: File | null;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File) => void;
  disabled?: boolean;
}

export default function EvidenceFormFields({
  description,
  file,
  onDescriptionChange,
  onFileChange,
  disabled,
}: EvidenceFormFieldsProps) {
  return (
    <>
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
    </>
  );
}
