"use client";

import { useQuery } from "@tanstack/react-query";
import Identicon from "components/Identicon";
import LoadableImage from "components/LoadableImage";
import { getRegistrationPhoto } from "data/evidence";
import type { StoredReferral } from "data/referralAttribution";
import { safeIpfsUrl } from "utils/ipfs";

const ReferralAvatar: React.FC<{
  referral: StoredReferral;
  diameter: number;
  className: string;
}> = ({ referral, diameter, className }) => {
  const { data: photo } = useQuery({
    queryKey: ["registrationPhoto", referral.evidenceUri],
    queryFn: () => getRegistrationPhoto(referral.evidenceUri!),
    enabled: !!referral.evidenceUri,
  });
  const photoUrl = safeIpfsUrl(photo);

  if (photoUrl)
    return (
      <LoadableImage
        alt={referral.name}
        src={photoUrl}
        className={className}
        fallbackLabel="Photo unavailable"
      />
    );
  return (
    <Identicon address={referral.referrerHumanityId} diameter={diameter} />
  );
};

export default ReferralAvatar;
