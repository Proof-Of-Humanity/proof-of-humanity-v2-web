import type { SupportedChainId, paramToChain } from "config/chains";
import type { HumanityEventRecord } from "data/humanityEvents";
import type { RequestQuery } from "generated/graphql";
import type { ReactNode } from "react";
import type { EvidenceFile, RegistrationFile } from "types/docs";
import type { Address } from "viem";

export type RequestPageRequest = NonNullable<RequestQuery["request"]>;

export type RequestChain = NonNullable<ReturnType<typeof paramToChain>>;

export type IdentityEvidence = {
  id?: string;
  uri: string;
  creationTime?: number | string;
  submitter?: string;
};

export type IdentitySourceRequest = {
  chainId: SupportedChainId;
  claimer: {
    id: string;
    name?: string | null;
  };
  creationTime?: number | string;
  evidenceGroup: {
    evidence: IdentityEvidence[];
  };
  inTransferHash?: string | null;
  index: number | string;
  lastStatusChange: number | string;
  requester?: string;
};

export type RequestIdentityViewData = {
  displayedClaimerId: Address;
  identityClaimerName: string;
  registrationFilePromise: Promise<RegistrationFile | null>;
  revocationFilePromise: Promise<EvidenceFile | null>;
};

export type RequestIdentityCardProps = {
  chain: RequestChain;
  humanityEventsPromise: Promise<HumanityEventRecord[]>;
  policyLink: string | null;
  pohId: `0x${string}`;
  request: RequestPageRequest;
  requestInfo: ReactNode;
  timeline: ReactNode;
  vouchedFor: ReactNode;
  vouchers: ReactNode;
};
