"use client";

import useProfilePhoto from "hooks/useProfilePhoto";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Identicon from "./Identicon";

interface VouchProps {
  isActive: boolean | undefined;
  evidenceUri: string | undefined;
  idx: number;
  href: string;
  pohId: any;
  address: `0x${string}` | undefined;
  tooltip: ReactNode;
  tooltipPlacement?: "above" | "below";
}

const Vouch: React.FC<VouchProps> = ({
  isActive,
  evidenceUri,
  idx: key,
  href,
  pohId,
  address,
  tooltip,
  tooltipPlacement = "above",
}) => {
  const avatarClassName = `w-8 h-8 rounded-full cursor-pointer object-cover ${
    !isActive ? "opacity-25" : ""
  }`;
  const photoUrl = useProfilePhoto(evidenceUri);

  return (
    <Link key={key} href={pohId && href}>
      <div className="group relative flex">
        {photoUrl ? (
          <Image
            className={avatarClassName}
            alt="image"
            src={photoUrl}
            width={64}
            height={64}
            unoptimized={true} //Skips cache
          />
        ) : (
          <Identicon key={key} address={address} diameter={32} />
        )}
        <div
          className={`tooltip-surface invisible absolute left-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 text-center text-sm font-normal group-hover:visible ${
            tooltipPlacement === "below" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {tooltip}
        </div>
      </div>
    </Link>
  );
};

export default Vouch;
