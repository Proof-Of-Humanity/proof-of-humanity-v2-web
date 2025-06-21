import axios from "axios";

export const ipfs = (uri: string) =>
  `https://${process.env.REACT_APP_IPFS_GATEWAY}${uri}`;

export const ipfsFetch = async <F>(ipfsURI: string) =>
  (await axios.get(ipfs(ipfsURI))).data as F;
