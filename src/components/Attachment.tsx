"use client";

import Link from "next/link";
import { attachmentHref, safeAttachmentUrl } from "utils/ipfs";
import AttachmentIcon from "icons/AttachmentMajor.svg";

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  const href = attachmentHref(safeAttachmentUrl(uri));

  if (!href) return null;

  return (
    <Link href={href}>
      <AttachmentIcon className="h-4 w-4 fill-black" />
    </Link>
  );
};

export default Attachment;
