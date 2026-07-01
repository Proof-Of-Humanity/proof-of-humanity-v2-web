"use client";

import Link from "next/link";
import WarningIcon from "icons/WarningCircleMajor.svg";

interface InvalidReferralLinkProps {
  // Distinguish a malformed link from one that has expired.
  reason?: "invalid" | "expired";
}

const COPY = {
  invalid: {
    title: "Invalid Link!",
    description: "Oops, seems like you followed an invalid referral link.",
  },
  expired: {
    title: "Link Expired",
    description: "This referral link has expired and can no longer be used.",
  },
};

const InvalidReferralLink: React.FC<InvalidReferralLinkProps> = ({
  reason = "invalid",
}) => {
  const { title, description } = COPY[reason];

  return (
    <div className="text-primaryText my-12 flex w-full flex-col items-center text-center">
      <span className="text-status-rejected mb-4">
        <WarningIcon className="h-14 w-14" />
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-secondaryText mt-2 max-w-md">{description}</p>
      <Link href="/" className="btn-primary mt-6 px-8 py-2.5">
        Go to Homepage
      </Link>
    </div>
  );
};

export default InvalidReferralLink;
