import axios from "axios";

/**
 * Builds a gateway URL from an IPFS URI.  Accepts formats like:
 *   – "ipfs://<cid>"
 *   – "/ipfs/<cid>"
 *   – "<cid>" | "/<cid>"
 */
export const ipfs = (uri: string): string => {
  if (!uri) return "";

  // Remove protocol if present
  let clean = uri.replace(/^ipfs:\/\//, "");

  // Ensure the path starts with /ipfs/<cid>
  if (!clean.startsWith("/ipfs/")) {
    clean = clean.replace(/^\/+/, ""); // trim leading slashes
    clean = `/ipfs/${clean}`;
  }

  // Prefix with gateway host (configured without trailing slash)
  return `https://${process.env.REACT_APP_IPFS_GATEWAY}${clean}`;
};

/**
 * Fetches a resource from IPFS and returns JSON (or raw data if not JSON).
 * This is more tolerant of gateways that don't set `Content-Type: application/json`.
 */
export const ipfsFetch = async <F>(ipfsURI: string): Promise<F> => {
  const res = await axios.get(ipfs(ipfsURI), {
    // Force text so we can JSON.parse manually when needed
    responseType: "text",
  });

  let { data } = res;

  // Attempt to parse JSON manually if we received a string
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (_) {
      /* ignore – return raw string */
    }
  }

  return data as unknown as F;
};
