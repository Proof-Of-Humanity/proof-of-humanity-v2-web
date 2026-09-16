"use client";

import { useQuery } from "@tanstack/react-query";
import Identicon from "components/Identicon";
import LoadableImage from "components/LoadableImage";
import { getRegistrationPhoto } from "data/evidence";
import { safeIpfsUrl } from "utils/ipfs";

interface ReferralAvatarProps {
  address: `0x${string}`;
  /** Registration evidence URI; the photo is resolved here, per avatar, so a
   *  slow IPFS gateway only delays this image and never the surrounding list. */
  evidenceUri?: string | null;
  alt: string;
  diameter: number;
  className: string;
}

const ReferralAvatar: React.FC<ReferralAvatarProps> = ({
  address,
  evidenceUri,
  alt,
  diameter,
  className,
}) => {
  const { data: photo } = useQuery({
    queryKey: ["registrationPhoto", evidenceUri],
    queryFn: () => getRegistrationPhoto(evidenceUri!),
    enabled: !!evidenceUri,
  });
  // Profile-controlled path; an invalid URI falls back to the identicon.
  const photoUrl = safeIpfsUrl(photo);
  const identicon = <Identicon address={address} diameter={diameter} />;

  if (!photoUrl) return identicon;
  return (
    <LoadableImage
      alt={alt}
      src={photoUrl}
      className={className}
      errorFallback={identicon}
    />
  );
};

export default ReferralAvatar;
