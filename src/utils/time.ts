import humanizeDuration from "humanize-duration";
import { format } from "timeago.js";

interface PohRequest {
  status: { id: string };
  expirationTime: string | number | undefined;
  creationTime: string | number;
  index: number;
}

export const timeAgo = (s: number) => format(s * 1000);

/**
 * Humanize a duration in seconds to its largest sensible unit:
 * 600 -> "10 minutes", 3599 -> "1 hour", 86400 -> "1 day".
 */
export const formatDuration = (seconds: number) =>
  humanizeDuration(seconds * 1000, { largest: 1, round: true });

const LEGACY_REQUEST_LIFESPAN = 63115200; // 2 years in seconds

export const isRequestExpired = (
  request: PohRequest,
  contractData?: { humanityLifespan?: string | number },
): boolean => {
  const { status, index, expirationTime } = request;
  const currentTime = Date.now() / 1000;

  if (status.id === "resolved") {
    if (
      expirationTime === undefined ||
      expirationTime === null ||
      Number(expirationTime) === 0
    )
      return false;
    return Number(expirationTime) < currentTime;
  }

  const humanityLifespan = contractData?.humanityLifespan;

  const isLegacyRequest = index < 0 && index > -100;
  const lifespan = isLegacyRequest
    ? LEGACY_REQUEST_LIFESPAN
    : humanityLifespan
      ? Number(humanityLifespan)
      : Infinity;

  const isExpiredTransferring = (req: PohRequest): boolean => {
    if (req.expirationTime !== undefined && req.expirationTime !== null) {
      return Number(req.expirationTime) < currentTime;
    }
    if (lifespan === Infinity) return false;
    return Number(req.creationTime) + Number(lifespan) < currentTime;
  };

  if (status.id === "transferring") {
    return isExpiredTransferring(request);
  }

  return false;
};
