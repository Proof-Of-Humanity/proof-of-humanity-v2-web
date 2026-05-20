import type { paramToChain } from "config/chains";
import type { RequestQuery } from "generated/graphql";
import type { ReactNode } from "react";
import type { EvidenceFile, RegistrationFile } from "types/docs";

export type RequestPageRequest = NonNullable<RequestQuery["request"]>;

export type RequestChain = NonNullable<ReturnType<typeof paramToChain>>;

export type RequestIdentityEvidence = {
  id?: string;
  uri: string;
  creationTime?: number | string;
  submitter?: string;
};

export type RequestIdentitySource = {
  claimer: {
    id: string;
    name?: string | null;
  };
  creationTime: number | string;
  evidenceGroup: {
    evidence: RequestIdentityEvidence[];
  };
  lastStatusChange: number | string;
  requester: string;
};

export type RequestEvidenceSource = {
  evidence: RequestIdentityEvidence[];
  requester: string;
};

export type RequestIdentityFiles = {
  registrationFilePromise: Promise<RegistrationFile | null>;
  revocationFilePromise: Promise<EvidenceFile | null>;
};

export type RequestIdentityCardProps = {
  chain: RequestChain;
  identity: RequestIdentitySource;
  policyMetaEvidenceUri: string;
  pohId: `0x${string}`;
  request: RequestPageRequest;
  requestInfo: ReactNode;
  timeline: ReactNode;
  vouchedFor: ReactNode;
  vouchers: ReactNode;
};
