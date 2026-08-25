"use client";

import Link from "next/link";
import AttachmentIcon from "icons/AttachmentMajor.svg";

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  if (!uri) return null;

  return (
    <Link
      className="text-orange inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:opacity-80"
      href={`/attachment?url=${encodeURIComponent(uri)}`}
      aria-label="View attachment"
    >
      View Attachment
      <AttachmentIcon className="h-4 w-4 fill-current" />
    </Link>
  );
};

export default Attachment;
