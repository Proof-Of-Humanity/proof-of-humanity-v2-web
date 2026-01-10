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

const STATUS_COLORS = {
  vouching: "vouching",
  claim: "claim", 
  revocation: "revocation",
  challenged: "challenged",
  registered: "registered",
  removed: "removed",
  rejected: "rejected",
  expired: "expired",
  withdrawn: "withdrawn",
  transferred: "transferred",
  transferring: "transferring",
  white: "white"
} as const;

type StatusColor = typeof STATUS_COLORS[keyof typeof STATUS_COLORS];

type StaticFilterConfig = {
  baseLabel: string;
  tooltip?: string;
  color: StatusColor;
  filter: Request_Filter;
};

type DynamicFilterConfig = {
  baseLabel: string;
  tooltip?: string;
  color: StatusColor;
  getFilter: () => Request_Filter;
};

type StatusConfig = StaticFilterConfig | DynamicFilterConfig;

// Centralized status configuration
const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  [RequestStatus.VOUCHING]: {
    baseLabel: "Needs Vouch",
    tooltip: "Profile submitted; still needs a vouch and/or full deposit.",
    color: STATUS_COLORS.vouching,
    filter: { status: "vouching" }
  },
  [RequestStatus.PENDING_CLAIM]: {
    baseLabel: "In Review", 
    tooltip: "Submission challenge window is open; can be challenged.",
    color: STATUS_COLORS.claim,
    filter: { status: "resolving", revocation: false }
  },
  [RequestStatus.PENDING_REVOCATION]: {
    baseLabel: "Removal Proposed",
    tooltip: "Someone asked to remove profile; challenge window open.",
    color: STATUS_COLORS.revocation,
    filter: { status: "resolving", revocation: true }
  },
  [RequestStatus.DISPUTED_CLAIM]: {
    baseLabel: "Challenged",
    tooltip: "Submission challenged; Kleros is judging.",
    color: STATUS_COLORS.challenged,
    filter: { status: "disputed", revocation: false }
  },
  [RequestStatus.DISPUTED_REVOCATION]: {
    baseLabel: "Removal Challenged",
    tooltip: "Profile removal is challenged; Kleros is judging.",
    color: STATUS_COLORS.challenged, 
    filter: { status: "disputed", revocation: true }
  },
  [RequestStatus.RESOLVED_CLAIM]: {
    baseLabel: "Verified Human",
    tooltip: "Submission accepted; included as human.",
    color: STATUS_COLORS.registered,
    getFilter: () => ({ 
      status: "resolved", 
      winnerParty_: { id: "requester" }, 
      revocation: false, 
      expirationTime_gt: Math.floor(Date.now() / 1000) 
    })
  },
  [RequestStatus.RESOLVED_REVOCATION]: {
    baseLabel: "Removed",
    tooltip: "Profile removed after due process.",
    color: STATUS_COLORS.removed,
    filter: { status: "resolved", revocation: true }
  },
  [RequestStatus.REJECTED]: {
    baseLabel: "Rejected",
    tooltip: "Submission was rejected after being challenged.",
    color: STATUS_COLORS.rejected,
    filter: { status: "resolved", revocation: false, winnerParty_: { id_not: "requester" } }
  },
  [RequestStatus.EXPIRED]: {
    baseLabel: "Expired", 
    tooltip: "Registration expired; needs renewal to stay verified.",
    color: STATUS_COLORS.expired,
    getFilter: () => ({ 
      status: "resolved", 
      revocation: false, 
      expirationTime_lt: Math.floor(Date.now() / 1000), 
      winnerParty_: { id: "requester" } 
    })
  },
  [RequestStatus.WITHDRAWN]: {
    baseLabel: "Withdrawn",
    tooltip: "Submitter cancelled before verification.",
    color: STATUS_COLORS.withdrawn,
    filter: { status: "withdrawn" }
  },
  [RequestStatus.TRANSFERRED]: {
    baseLabel: "Transferred",
    tooltip: "Profile moved to a diffent chain",
    color: STATUS_COLORS.transferred,
    filter: { status: "transferred" }
  },
  [RequestStatus.TRANSFERRING]: {
    baseLabel: "Pending Update",
    tooltip: "Profile is being moved to a different chain",
    color: STATUS_COLORS.transferring,
    filter: { status: "transferring" }
  },
  [RequestStatus.ALL]: {
    baseLabel: "All",
    color: STATUS_COLORS.white,
    filter: {}
  }
};

const REQUEST_STATUS_COLORS = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([status, config]) => [status, config.color])
) as Record<RequestStatus, StatusColor>;

/**
 * Get the filter object for a given request status.
 * This function ensures that time-dependent filters use the current timestamp.
 * @param status The request status to get the filter for
 * @returns Filter object with current timestamp for time-dependent filters
 */
export const getRequestStatusFilter = (status: RequestStatus): Request_Filter => {
  const config = STATUS_CONFIG[status];
  if ('getFilter' in config) {
    return config.getFilter();
  }
  return config.filter;
};
/**
 * List of all status filter options for UI dropdowns.
 */
export const STATUS_FILTER_OPTIONS = Object.values(RequestStatus).filter(
  status => ![RequestStatus.TRANSFERRING].includes(status)
);

const isRejectedRequest = (request: RawRequestData): boolean => {
  return request.status.id === "resolved" &&
    !request.revocation &&
    request.winnerParty?.id !== "requester";
};

/**
 * Determines the RequestStatus enum value from raw status data.
 */
const getRequestStatus = (
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
  expirationTime?: number | string;
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
      expirationTime: request.expirationTime,
      index: request.index,
    },
    contractData,
  );
  const rejected = isRejectedRequest(request);

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
 * @param component Component type to determine which labels to use ('actionBar' | 'card')
 * @returns Human-readable display string
 */
export const getStatusLabel = (status: RequestStatus, component: 'actionBar' | 'card' = 'card'): string => {
  const config = STATUS_CONFIG[status];
  return config.baseLabel;
};

/**
 * Helper function to get the tooltip for a RequestStatus enum value.
 * @param status RequestStatus enum value
 * @returns Tooltip string
 */
export const getStatusTooltip = (status: RequestStatus): string | undefined => {
  const config = STATUS_CONFIG[status];
  return config.tooltip;
};

/**
 * Helper function to get the color class for a RequestStatus enum value.
 * @param status RequestStatus enum value
 * @returns Tailwind color class name
 */
export const getStatusColor = (status: RequestStatus): string => {
  return REQUEST_STATUS_COLORS[status];
};
