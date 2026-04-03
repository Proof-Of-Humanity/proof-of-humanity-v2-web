import { Address, Hash } from "viem";
import { RequestStatus } from "utils/status";

export type RequestPendingAction =
  | "fund"
  | "challenge"
  | "evidence"
  | "vouch"
  | "removeVouch"
  | "withdraw"
  | "advance"
  | "execute";

export type ProfilePendingAction =
  | "revoke"
  | "transfer"
  | "update"
  | "relayTransfer"
  | "relayUpdate";

export interface OptimisticEvidenceItem {
  id: string;
  uri: string;
  creationTime: number;
  submitter: Address;
}

export interface RequestOptimisticBase {
  status: string;
  requestStatus: RequestStatus;
  lastStatusChange: number;
  funded: bigint;
  totalCost: bigint;
  validVouches: number;
  onChainVouches: Address[];
  offChainVouches: { voucher: Address; expiration: number; signature: Hash }[];
  evidenceList: OptimisticEvidenceItem[];
  revocation: boolean;
}

export interface RequestOptimisticOverlay {
  status?: string;
  requestStatus?: RequestStatus;
  lastStatusChange?: number;
  funded?: bigint;
  validVouches?: number;
  onChainVouches?: Address[];
  offChainVouches?: { voucher: Address; expiration: number; signature: Hash }[];
  evidenceList?: OptimisticEvidenceItem[];
}

export interface ProfileOptimisticBase {
  winningStatus?: string;
  pendingRevocation: boolean;
  lastTransferTimestamp?: number;
  lastOutUpdateTimestamp?: number;
  hasPendingUpdateRelay: boolean;
  hasPendingTransferRelay: boolean;
}

export interface ProfileOptimisticOverlay {
  winningStatus?: string;
  pendingRevocation?: boolean;
  lastTransferTimestamp?: number;
  lastOutUpdateTimestamp?: number;
  hasPendingUpdateRelay?: boolean;
  hasPendingTransferRelay?: boolean;
}
