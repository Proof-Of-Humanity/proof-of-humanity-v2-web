"use client";

import Link from "next/link";
import { safeIpfsUrl } from "utils/ipfs";
import AttachmentIcon from "icons/AttachmentMajor.svg";

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  const url = safeIpfsUrl(uri);

  if (!url) return null;

  return (
    <Link href={`/attachment?url=${encodeURIComponent(url)}`}>
      <AttachmentIcon className="h-4 w-4 fill-black" />
    </Link>
  );
};

export default Attachment;
