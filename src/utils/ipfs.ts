import axios from "axios";

/**
 * Returns the configured HTTPS IPFS gateway origin. Normalizing to an origin
 * keeps later checks to protocol + host + port, so a gateway value containing
 * a path cannot change the trusted boundary.
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
 * Converts an IPFS reference (`/ipfs/...`, `ipfs/...`, `ipfs://...`) to a URL
 * on the configured gateway. Anything else returns null so untrusted metadata
 * cannot point the app at another host.
 */
export const getIpfsUrl = (uri?: string | null) => {
  const path = uri?.startsWith("/ipfs/")
    ? uri
    : uri?.startsWith("ipfs/")
      ? `/${uri}`
      : uri?.startsWith("ipfs://")
        ? uri.replace("ipfs://", "/ipfs/")
        : null;

  if (!path) return null;

  const url = new URL(path, getGatewayOrigin());

  return url.pathname.startsWith("/ipfs/") ? url.toString() : null;
};

export const ipfs = (uri: string) => getIpfsUrl(uri) ?? "";

/**
 * Validates an untrusted attachment URL: accepts IPFS references or HTTPS
 * URLs already on the configured gateway under `/ipfs/`. Returns null for
 * everything else (other origins, `javascript:`, `data:`, ...).
 */
export const safeAttachmentUrl = (url?: string | null) => {
  const ipfsUrl = getIpfsUrl(url);
  if (ipfsUrl) return ipfsUrl;

  if (!url) return null;

  try {
    const parsed = new URL(url.trim());

    return parsed.protocol === "https:" &&
      parsed.origin === getGatewayOrigin() &&
      parsed.pathname.startsWith("/ipfs/")
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

export const ipfsFetch = async <F>(ipfsURI: string) => {
  const url = getIpfsUrl(ipfsURI);

  if (!url) throw new Error("Invalid IPFS URI.");

  return (await axios.get(url)).data as F;
};
