"use client";

import ExternalLink from "components/ExternalLink";
import ExternalLinkIcon from "components/ExternalLinkIcon";

interface AttachmentProps {
  uri: string;
}

const Attachment: React.FC<AttachmentProps> = ({ uri }) => {
  if (!uri) return null;

  return (
    <ExternalLink
      className="text-orange group/external-link inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:opacity-80"
      href={`/attachment?url=${encodeURIComponent(uri)}`}
      aria-label="View attachment (opens in a new tab)"
    >
      View Attachment
      <ExternalLinkIcon />
    </ExternalLink>
  );
};

export default Attachment;
