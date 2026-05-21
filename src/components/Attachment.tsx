"use client";

import Link from "next/link";
import AttachmentIcon from "icons/AttachmentMajor.svg";

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  if (!uri) return null;

  return (
    <Link href={`/attachment?url=${encodeURIComponent(ipfsUri)}`}>
      <AttachmentIcon className="fill-primaryText h-4 w-4" />
    </Link>
  );
};

export default Attachment;
