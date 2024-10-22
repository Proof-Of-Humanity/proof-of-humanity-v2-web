import useSWR from "swr";
import { ipfsFetch } from "utils/ipfs";

interface useIPFSConfig {
  suspense?: boolean;
}

const useIPFS = <T>(
  uri?: string | null | false,
  { suspense }: useIPFSConfig = {},
): [T | undefined, Error] => {
  const { data, error } = useSWR(uri || null, ipfsFetch<T>, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    suspense,
  });

  return [data, error];
};

export default useIPFS;
