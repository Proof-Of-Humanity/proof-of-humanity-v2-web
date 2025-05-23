import { format } from "timeago.js";

export const timeAgo = (s: number) => format(s * 1000);

/**
 * Determines if a request is expired based on its status and related data
 * @param request The request object to check
 * @param contractData Contract data containing humanityLifespan
 * @returns Boolean indicating if the request is expired
 */
export const isRequestExpired = (
  request: {
    status: { id: string };
    creationTime: string | number;
    revocation?: boolean;
    humanity: {
      winnerClaim: Array<{ index: number; resolutionTime?: string | number }>;
      registration?: { expirationTime: string | number } | null;
      nbRequests?: string | number;
      nbLegacyRequests?: string | number;
    };
    index: number;
    winnerParty?: { id: string } | null;
  },
  contractData: { humanityLifespan?: string | number },
  totalRequests?: number
): boolean => {
  const { status, creationTime, revocation, humanity, index } = request;
  const { humanityLifespan } = contractData;
  const currentTime = Date.now() / 1000;
  
  // Check for transferring status first
  if (status.id === "transferring" && humanityLifespan) {
    return Number(creationTime) + Number(humanityLifespan) < currentTime;
  }
  
  // Check for resolved status
  if (status.id === "resolved") {
    // Must not be a revocation and must have winner claims
    if (revocation || humanity.winnerClaim.length === 0) {
      return false;
    }
    
    // Calculate total requests for this humanity
    const totalRequestsForHumanity = totalRequests !== undefined ? totalRequests : 
      (humanity.nbRequests ? Number(humanity.nbRequests) : 0) + 
      (humanity.nbLegacyRequests ? Number(humanity.nbLegacyRequests) : 0);

    
    // This request must be a winner claim to check registration expiration
    const isWinnerClaim = humanity.winnerClaim.some(claim => claim.index === index);
    if (isWinnerClaim && humanityLifespan) {
      // Check if registration is missing or expired or if this is not the latest request
      return !humanity.registration || 
             Number(humanity.registration.expirationTime) < currentTime ||
            (totalRequestsForHumanity > 0 && index < totalRequestsForHumanity - 1);
    }
  }
  return false;
};
