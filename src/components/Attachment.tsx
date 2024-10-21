'use client';

import Link from 'next/link';
import { ipfs } from 'utils/ipfs';
import AttachmentIcon from 'icons/AttachmentMajor.svg';

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  const ipfsUri = ipfs(uri);

  return (
    <Link href={`/attachment?url=${encodeURIComponent(ipfsUri)}`}>
      <AttachmentIcon className="h-4 w-4 fill-black" />
    </Link>
  );
};

export default Attachment;
