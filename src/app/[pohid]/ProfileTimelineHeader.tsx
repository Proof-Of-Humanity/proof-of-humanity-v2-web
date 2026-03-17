"use client";

import ErrorBoundary from "components/ErrorBoundary";
import useIPFS from "hooks/useIPFS";
import { Suspense } from "react";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { shortenAddress } from "utils/address";
import { ipfs } from "utils/ipfs";
import { Address } from "viem";

export interface ProfileTimelineHeaderProps {
  claimer: {
    name?: string | null;
  };
  evidence: { uri: string }[];
  humanityWinnerClaim: {
    evidenceGroup: {
      evidence: { uri: string }[];
    };
  }[];
  registrationEvidenceRevokedReq: string;
  requester: Address;
  revocation: boolean;
}

function HeaderContent({
  claimer,
  evidence,
  humanityWinnerClaim,
  registrationEvidenceRevokedReq,
  requester,
  revocation,
}: ProfileTimelineHeaderProps) {
  const [evidenceURI] = useIPFS<EvidenceFile>(
    revocation
      ? registrationEvidenceRevokedReq ||
      humanityWinnerClaim.at(0)?.evidenceGroup.evidence.at(-1)?.uri
      : evidence.at(-1)?.uri,
    { suspense: true },
  );
  const [data] = useIPFS<RegistrationFile>(evidenceURI?.fileURI, {
    suspense: true,
  });

  const name =
    data && claimer.name && data.name !== claimer.name
      ? `${data.name} (aka ${claimer.name})`
      : claimer.name || data?.name || "";

  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className="h-12 w-12 shrink-0 rounded-full bg-slate-200 bg-cover bg-center bg-no-repeat -ml-1"
        style={
          data?.photo
            ? { backgroundImage: `url('${ipfs(data.photo)}')` }
            : undefined
        }
      />
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
