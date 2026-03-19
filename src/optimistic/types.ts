import { Address, Hash } from "viem";
import { RequestStatus } from "utils/status";

export interface OptimisticEvidenceItem {
  id: string;
  uri: string;
  creationTime: number;
  submitter: Address;
  pending?: boolean;
}

export interface RequestOptimisticBase {
  status: string;
  requestStatus: RequestStatus;
  funded: bigint;
  totalCost: bigint;
  validVouches: number;
  onChainVouches: Address[];
  offChainVouches: { voucher: Address; expiration: number; signature: Hash }[];
  evidenceList: OptimisticEvidenceItem[];
  revocation: boolean;
  currentChallengeDisputeId?: string;
}

export interface RequestOptimisticOverlay {
  status?: string;
  requestStatus?: RequestStatus;
  funded?: bigint;
  validVouches?: number;
  onChainVouches?: Address[];
  offChainVouches?: { voucher: Address; expiration: number; signature: Hash }[];
  appendedEvidence?: OptimisticEvidenceItem[];
  pendingChallenge?: {
    disputeId?: string;
    createdAt: number;
  };
}

export interface ProfileOptimisticBase {
  winningStatus?: string;
  hasPendingRevocation: boolean;
}

export interface ProfileOptimisticOverlay {
  pendingRevocation?: boolean;
  pendingTransfer?: boolean;
  pendingUpdate?: boolean;
}
