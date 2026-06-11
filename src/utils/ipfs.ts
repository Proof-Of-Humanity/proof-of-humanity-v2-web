import axios from "axios";

const GATEWAY_ORIGIN = new URL(`https://${process.env.REACT_APP_IPFS_GATEWAY}`)
  .origin;

export const safeIpfsUrl = (uri?: string | null) => {
  if (!uri) return null;

  try {
    const url = new URL(
      uri.trim().replace(/^ipfs(:\/\/|\/)/, "/ipfs/"),
      GATEWAY_ORIGIN,
    );

    return url.origin === GATEWAY_ORIGIN && url.pathname.startsWith("/ipfs/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

export const ipfs = (uri: string) => safeIpfsUrl(uri) ?? "";

export const ipfsFetch = async <F>(ipfsURI: string) => {
  const url = safeIpfsUrl(ipfsURI);

  if (!url) throw new Error("Invalid IPFS URI.");

  return (await axios.get(url)).data as F;
};
