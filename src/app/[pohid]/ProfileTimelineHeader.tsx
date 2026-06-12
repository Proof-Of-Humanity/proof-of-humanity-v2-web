"use client";

import ErrorBoundary from "components/ErrorBoundary";
import useIPFS from "hooks/useIPFS";
import Image from "next/image";
import { Suspense } from "react";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { shortenAddress } from "utils/address";
import { safeIpfsUrl } from "utils/ipfs";
import { Address } from "viem";

export interface ProfileTimelineHeaderProps {
  claimer: {
    name?: string | null;
  };
  evidence: { uri: string }[];
  requester: Address;
}

function HeaderContent({
  claimer,
  evidence,
  requester,
}: ProfileTimelineHeaderProps) {
  const [evidenceURI] = useIPFS<EvidenceFile>(evidence.at(-1)?.uri, {
    suspense: true,
  });
  const [data] = useIPFS<RegistrationFile>(evidenceURI?.fileURI, {
    suspense: true,
  });

  const name =
    data && claimer.name && data.name !== claimer.name
      ? `${data.name} (aka ${claimer.name})`
      : claimer.name || data?.name || "";
  const photoUrl = safeIpfsUrl(data?.photo);

  return (
    <div className="mb-6 flex items-center gap-3">
      {photoUrl ? (
        <Image
          alt="Profile photo"
          className="-ml-1 h-12 w-12 shrink-0 rounded-full object-cover"
          src={photoUrl}
          width={48}
          height={48}
          unoptimized={true}
        />
      ) : (
        <div className="-ml-1 h-12 w-12 shrink-0 rounded-full bg-slate-200" />
      )}
      <div className="min-w-0">
        <div className="text-primaryText flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{name || "Unknown"}</span>
          <span className="text-secondaryText text-xs">
            {shortenAddress(requester)}
          </span>
        </div>
      </div>
    </div>
  );
}

const HeaderFallback = ({
  claimer,
  requester,
}: Pick<ProfileTimelineHeaderProps, "claimer" | "requester">) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
    <div className="min-w-0">
      <div className="text-primaryText flex items-center gap-2 text-sm font-medium">
        <span className="truncate">{claimer.name || "Unknown"}</span>
        <span className="text-secondaryText text-xs">
          {shortenAddress(requester)}
        </span>
      </div>
    </div>
  </div>
);

export default function ProfileTimelineHeader(
  props: ProfileTimelineHeaderProps,
) {
  return (
    <ErrorBoundary
      fallback={
        <HeaderFallback claimer={props.claimer} requester={props.requester} />
      }
      resetSwitch={props.evidence.at(0)?.uri}
    >
      <Suspense
        fallback={
          <HeaderFallback claimer={props.claimer} requester={props.requester} />
        }
      >
        <HeaderContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
