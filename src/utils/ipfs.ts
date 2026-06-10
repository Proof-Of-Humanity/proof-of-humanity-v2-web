import axios from "axios";

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

/**
 * @notice Converts an IPFS path to a URL on the configured gateway.
 * @dev Only canonical `/ipfs/...` paths are accepted. Rejecting absolute,
 * protocol-relative, and host-like values prevents attacker-controlled IPFS
 * metadata from escaping to another origin.
 */
export const safeIpfs = (uri?: string | null) =>
  uri?.startsWith("/ipfs/")
    ? new URL(uri, `${getGatewayOrigin()}/`).toString()
    : null;

/**
 * @notice Converts a required IPFS path to a gateway URL.
 * @dev Use this for trusted app data where an invalid URI should fail loudly.
 */
export const ipfs = (uri: string) => {
  const url = safeIpfs(uri);

  if (!url) throw new Error("Invalid IPFS URI.");

  return url;
};

/**
 * @notice Checks whether a URL points to the configured IPFS gateway.
 * @dev This validates URLs that have already been expanded with `ipfs` or
 * `safeIpfs`, especially `/attachment?url=...` values before rendering or
 * linking them.
 */
export const isAllowedIpfsGatewayUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.origin === getGatewayOrigin() &&
      parsed.pathname.startsWith("/ipfs/")
    );
  } catch {
    return false;
  }
};

/**
 * @notice Builds an internal attachment route for a validated IPFS gateway URL.
 * @dev Returns null for unsupported URLs so callers can avoid rendering unsafe
 * attachment links.
 */
export const attachmentHref = (url?: string | null) =>
  url && isAllowedIpfsGatewayUrl(url)
    ? `/attachment?url=${encodeURIComponent(url)}`
    : null;

/**
 * @notice Fetches JSON data from a required IPFS path.
 */
export const ipfsFetch = async <F>(ipfsURI: string) =>
  (await axios.get(ipfs(ipfsURI))).data as F;
