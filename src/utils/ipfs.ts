import axios from "axios";
import { sanitizeUrl } from "@braintree/sanitize-url";

const BLANK_URL = "about:blank";

/**
 * @notice Returns the configured HTTPS IPFS gateway origin.
 * @dev The origin is normalized once per call so later URL checks compare
 * protocol + host + port only. This prevents gateway values with paths from
 * changing the trusted attachment boundary.
 */
const getGatewayOrigin = () => {
  const gateway = process.env.REACT_APP_IPFS_GATEWAY;

  if (!gateway) {
    throw new Error("Missing IPFS gateway configuration.");
  }

  const gatewayUrl = new URL(
    gateway.startsWith("http://") || gateway.startsWith("https://")
      ? gateway
      : `https://${gateway}`,
  );

  if (gatewayUrl.protocol !== "https:") {
    throw new Error("Invalid IPFS gateway protocol.");
  }

  return gatewayUrl.origin;
};

export const sanitizeHref = (url?: string | null) => {
  if (!url) return "";

  const sanitized = sanitizeUrl(url.trim());
  return sanitized === BLANK_URL ? "" : sanitized;
};

/**
 * @notice Converts an IPFS path to a URL on the configured gateway.
 * @dev Canonical `/ipfs/...`, `ipfs/...`, and `ipfs://...` values are
 * normalized onto the configured gateway. Absolute and protocol-relative
 * values are rejected here so media metadata cannot silently escape origins.
 */
export const getIpfsUrl = (uri?: string | null) => {
  const path = uri?.startsWith("/ipfs/")
    ? uri
    : uri?.startsWith("ipfs/")
      ? `/${uri}`
      : uri?.startsWith("ipfs://")
        ? uri.replace("ipfs://", "/ipfs/")
        : null;

  return path ? new URL(path, `${getGatewayOrigin()}/`).toString() : null;
};

/**
 * @notice Converts a required IPFS path to a gateway URL.
 * @dev Use this for trusted app data where an invalid URI should fail loudly.
 */
export const ipfs = (uri: string) => {
  const url = getIpfsUrl(uri);

  if (!url) throw new Error("Invalid IPFS URI.");

  return url;
};

/**
 * @notice Checks whether a URL can be rendered by the attachment viewer.
 * @dev Mirrors Kleros v2's security-fix approach: sanitize first, then only
 * allow HTTPS URLs on the configured IPFS gateway under `/ipfs/`.
 */
export const getAllowedAttachmentUrl = (url?: string | null) => {
  const safe = sanitizeHref(url);
  if (!safe) return null;

  try {
    const parsed = new URL(safe);

    return parsed.protocol === "https:" &&
      parsed.origin === getGatewayOrigin() &&
      parsed.pathname.startsWith("/ipfs/")
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

/**
 * @notice Normalizes an untrusted evidence attachment URL.
 * @dev IPFS values are routed through the configured gateway. Already-expanded
 * URLs must pass `getAllowedAttachmentUrl`.
 */
export const safeAttachmentUrl = (uri?: string | null) => {
  const ipfsUrl = getIpfsUrl(uri);
  if (ipfsUrl) return ipfsUrl;

  return getAllowedAttachmentUrl(uri);
};

/**
 * @notice Builds an internal attachment route for a safe attachment URL.
 * @dev Returns null for unsupported URLs so callers can avoid rendering unsafe
 * attachment links.
 */
export const attachmentHref = (url?: string | null) =>
  (() => {
    const attachmentUrl = getAllowedAttachmentUrl(url);
    return attachmentUrl
      ? `/attachment?url=${encodeURIComponent(attachmentUrl)}`
      : null;
  })();

/**
 * @notice Fetches JSON data from a required IPFS path.
 */
export const ipfsFetch = async <F>(ipfsURI: string) =>
  (await axios.get(ipfs(ipfsURI))).data as F;
