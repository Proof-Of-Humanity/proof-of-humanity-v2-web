import axios from 'axios';

export const uploadToIPFS = async (data: FormData) => {
  const result = await axios.post('/api/ipfs-upload', data);
  return result.data.uri;
};

export const ipfs = (uri: string) => `https://${process.env.REACT_APP_IPFS_GATEWAY}${uri}`;

export const ipfsFetch = async <F>(ipfsURI: string) => (await axios.get(ipfs(ipfsURI))).data as F;
