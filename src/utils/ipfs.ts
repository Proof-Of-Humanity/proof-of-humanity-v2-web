import axios from "axios";
import { IPFS_GATEWAY } from "../config";

export const uploadToIPFS = async (data: FormData) => {
  const result = await axios.post("/api/ipfs-upload", data);
  return result.data.uri;
};

export const ipfs = (uri: string) => `https://${IPFS_GATEWAY}${uri}`;
//export const ipfs = (uri: string) => `https://ipfs.kleros.io${uri}`;

export const ipfsFetch = async <F>(ipfsURI: string) =>
  (await axios.get(ipfs(ipfsURI))).data as F;
