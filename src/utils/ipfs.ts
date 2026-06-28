import axios from "axios";

const getGatewayOrigin = () => {
  const gateway = process.env.REACT_APP_IPFS_GATEWAY?.trim().replace(
    /^https?:\/\//i,
    "",
  );

  if (!gateway) throw new Error("Missing IPFS gateway configuration.");

  try {
    return new URL(`https://${gateway}`).origin;
  } catch {
    throw new Error("Invalid IPFS gateway configuration.");
  }
};

export const safeIpfsUrl = (uri?: string | null) => {
  if (!uri) return null;
  const gatewayOrigin = getGatewayOrigin();

  try {
    const url = new URL(
      uri.trim().replace(/^ipfs(:\/\/|\/)/, "/ipfs/"),
      `${gatewayOrigin}/`,
    );

    return url.origin === gatewayOrigin && url.pathname.startsWith("/ipfs/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

export const ipfs = (uri: string) => {
  const url = safeIpfsUrl(uri);

  if (!url) throw new Error("Invalid IPFS URI.");

  return url;
};

export const ipfsFetch = async <F>(ipfsURI: string) => {
  const url = safeIpfsUrl(ipfsURI);

  if (!url) throw new Error("Invalid IPFS URI.");

  return (await axios.get(url)).data as F;
};
