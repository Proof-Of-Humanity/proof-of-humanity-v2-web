import { isRequestExpired } from "./time";
import { Request_Filter } from "generated/graphql";

export enum RequestStatus {
  VOUCHING = "VOUCHING",
  PENDING_CLAIM = "PENDING_CLAIM", 
  PENDING_REVOCATION = "PENDING_REVOCATION",
  DISPUTED_CLAIM = "DISPUTED_CLAIM",
  DISPUTED_REVOCATION = "DISPUTED_REVOCATION",
  RESOLVED_CLAIM = "RESOLVED_CLAIM",
  RESOLVED_REVOCATION = "RESOLVED_REVOCATION",
  REJECTED = "REJECTED", 
  EXPIRED = "EXPIRED",
  WITHDRAWN = "WITHDRAWN",
  TRANSFERRED = "TRANSFERRED",
  TRANSFERRING = "TRANSFERRING",
  ALL = "ALL"
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.VOUCHING]: "Vouching",
  [RequestStatus.PENDING_CLAIM]: "Pending Claim",
  [RequestStatus.PENDING_REVOCATION]: "Pending Revocation", 
  [RequestStatus.DISPUTED_CLAIM]: "Disputed Claim",
  [RequestStatus.DISPUTED_REVOCATION]: "Disputed Revocation",
  [RequestStatus.RESOLVED_CLAIM]: "Included",
  [RequestStatus.RESOLVED_REVOCATION]: "Resolved Revocation",
  [RequestStatus.REJECTED]: "Rejected",
  [RequestStatus.EXPIRED]: "Expired",
  [RequestStatus.WITHDRAWN]: "Withdrawn",
  [RequestStatus.TRANSFERRED]: "Transferred",
  [RequestStatus.TRANSFERRING]: "Transferring",
  [RequestStatus.ALL]: "All"
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.VOUCHING]: "vouching",
  [RequestStatus.PENDING_CLAIM]: "claim",
  [RequestStatus.PENDING_REVOCATION]: "revocation", 
  [RequestStatus.DISPUTED_CLAIM]: "challenged",
  [RequestStatus.DISPUTED_REVOCATION]: "challenged",
  [RequestStatus.RESOLVED_CLAIM]: "registered",
  [RequestStatus.RESOLVED_REVOCATION]: "removed",
  [RequestStatus.REJECTED]: "rejected",
  [RequestStatus.EXPIRED]: "expired",
  [RequestStatus.WITHDRAWN]: "withdrawn",
  [RequestStatus.TRANSFERRED]: "transferred",
  [RequestStatus.TRANSFERRING]: "transferring",
  [RequestStatus.ALL]: "white"
};

/**
 * Maps RequestStatus enum values to GraphQL Request_Filter objects for querying.
 */
export const REQUEST_STATUS_FILTERS: Record<RequestStatus, { filter: Request_Filter }> = {
  [RequestStatus.ALL]: { filter: {} },
  [RequestStatus.VOUCHING]: { filter: { status: "vouching" } },
  [RequestStatus.PENDING_CLAIM]: { filter: { status: "resolving", revocation: false } },
  [RequestStatus.PENDING_REVOCATION]: { filter: { status: "resolving", revocation: true } },
  [RequestStatus.DISPUTED_CLAIM]: { filter: { status: "disputed", revocation: false } },
  [RequestStatus.DISPUTED_REVOCATION]: { filter: { status: "disputed", revocation: true } },
  [RequestStatus.RESOLVED_CLAIM]: { filter: { status: "resolved", revocation: false } },
  [RequestStatus.RESOLVED_REVOCATION]: { filter: { status: "resolved", revocation: true } },
  [RequestStatus.REJECTED]: { filter: { status: "resolved", revocation: false, winnerParty_: { id_not: "requester" } } },
  [RequestStatus.EXPIRED]: { filter: { status: "resolved", revocation: false, expirationTime_lt: Date.now() / 1000 } },
  [RequestStatus.WITHDRAWN]: { filter: { status: "withdrawn" } },
  [RequestStatus.TRANSFERRED]: { filter: { status: "transferred" } },
  [RequestStatus.TRANSFERRING]: { filter: { status: "transferring" } },
};

/**
 * List of all status filter options for UI dropdowns.
 */
export const STATUS_FILTER_OPTIONS = Object.values(RequestStatus);

/**
 * Determines the RequestStatus enum value from raw status data.
 */
export const getRequestStatus = (
  status: string,
  revocation: boolean = false,
  expired: boolean = false,
  rejected: boolean = false
): RequestStatus => {
  switch (status) {
    case "vouching":
      return RequestStatus.VOUCHING;
    
    case "resolving":
      return revocation ? RequestStatus.PENDING_REVOCATION : RequestStatus.PENDING_CLAIM;
    
    case "disputed":
      return revocation ? RequestStatus.DISPUTED_REVOCATION : RequestStatus.DISPUTED_CLAIM;
    
    case "resolved":
      if (revocation) {
        return RequestStatus.RESOLVED_REVOCATION;
      }
      if (expired) {
        return RequestStatus.EXPIRED;
      }
      if (rejected) {
        return RequestStatus.REJECTED;
      }
      return RequestStatus.RESOLVED_CLAIM;
    
    case "withdrawn":
      return RequestStatus.WITHDRAWN;
    
    case "transferred":
      return RequestStatus.TRANSFERRED;
    
    case "transferring":
      return RequestStatus.TRANSFERRING;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
};

/**
 * A minimal subset of fields we need from the subgraph `Request` entity
 * to compute its final display status in the UI.
 */
export interface RawRequestData {
  status: { id: string };
  revocation: boolean;
  winnerParty?: { id: string } | null;
  index: number;
  creationTime: number | string;
  expirationTime?: number | string | null;
}

/**
 * @param request       Raw request object.
 * @param contractData  Optional contract data containing `humanityLifespan`.
 * @returns             RequestStatus enum value.
 */
export const getStatus = (
  request: RawRequestData,
  contractData?: { humanityLifespan?: string | number }
): RequestStatus => {

  const expired = isRequestExpired(
    {
      status: request.status,
      creationTime: request.creationTime,
      expirationTime: request.expirationTime as any,
      index: request.index,
    } as any,
    contractData,
  );
  const rejected =
    request.status.id === "resolved" &&
    !request.revocation &&
    request.winnerParty?.id !== "requester";

  return getRequestStatus(
    request.status.id,
    request.revocation,
    expired,
    rejected,
  );
};

/**
 * Helper function to get the display label for a RequestStatus enum value.
 * @param status RequestStatus enum value
 * @returns Human-readable display string
 */
export const getStatusLabel = (status: RequestStatus): string => {
  return REQUEST_STATUS_LABELS[status];
};

/**
 * Helper function to get the color class for a RequestStatus enum value.
 * @param status RequestStatus enum value
 * @returns Tailwind color class name
 */
export const getStatusColor = (status: RequestStatus): string => {
  return REQUEST_STATUS_COLORS[status];
};
