import { format } from "timeago.js";

interface RequestHumanity {
  nbRequests?: string | number;
  nbLegacyRequests?: string | number;
  winnerClaim: Array<{ index: number; resolutionTime?: string | number }>;
  registration?: { expirationTime: string | number } | null;
}

interface PohRequest {
  status: { id: string };
  creationTime: string | number;
  revocation?: boolean;
  humanity: RequestHumanity;
  index: number;
  winnerParty?: { id: string } | null;
}

export const timeAgo = (s: number) => format(s * 1000);

const LEGACY_REQUEST_LIFESPAN = 63115200; // 2 years in seconds

export const isRequestExpired = (
  request: PohRequest,
  contractData: { humanityLifespan?: string | number }
): boolean => {
  const { status, index } = request;
  const { humanityLifespan } = contractData;

  const isLegacyRequest = index < 0 && index > -100;
  const lifespan = isLegacyRequest
    ? LEGACY_REQUEST_LIFESPAN
    : humanityLifespan;
  const currentTime = Date.now() / 1000;

  const isNotLatestRequest = (
    humanity: RequestHumanity,
    requestIndex: number
  ): boolean => {
    const hasV2Requests =
      humanity.nbRequests && Number(humanity.nbRequests) > 0;

    if (hasV2Requests) {
      const latestV2RequestIndex = Number(humanity.nbRequests) - 1;
      return requestIndex < latestV2RequestIndex;
    }

    if (Number(humanity.nbLegacyRequests) > 0) {
      const legacyWinnerClaims = humanity.winnerClaim.filter(
        (claim) => claim.index < 0
      );

      if (legacyWinnerClaims.length === 0) {
        return false;
      }

      const latestLegacyIndex = Math.min(
        ...legacyWinnerClaims.map((claim) => claim.index)
      );
      return requestIndex > latestLegacyIndex;
    }
    return false;
  };

  const isExpiredResolved = (
    req: PohRequest
  ): boolean => {
    const { revocation, humanity, index: reqIndex } = req;

    if (revocation || humanity.winnerClaim.length === 0) {
      return false;
    }

    const isWinnerClaim = humanity.winnerClaim.some(
      (claim) => claim.index === reqIndex
    );

    if (!isWinnerClaim) {
      return false;
    }

    
    const isNotLatest = isNotLatestRequest(humanity, reqIndex);

    return (
      !humanity.registration ||
      Number(humanity.registration.expirationTime) < currentTime ||
      isNotLatest
    );
  };

  const isExpiredTransferring = (
    req: PohRequest
  ): boolean => {
    return Number(req.creationTime) + Number(lifespan) < currentTime;
  };

  switch (status.id) {
    case "resolved":
      return isExpiredResolved(request);
    case "transferring":
      return isExpiredTransferring(request);
    default:
      return false;
  }
};

/**
 * Formats a relative time string for a given date
 * @param targetDate The date to format
 * @returns A string representing the relative time
 */
export const formatRelativeTime = (targetDate: Date): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return "now"; // Should ideally not happen if we only call for future dates

  const diffSeconds = Math.round(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''}`;
  
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
};
