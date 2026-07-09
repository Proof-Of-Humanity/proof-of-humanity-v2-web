import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ipfsFetch } from "utils/ipfs";

const RETRY_COUNT = 3;

// Jitter staggers retries so a grid of cards that got rate-limited together
// doesn't re-burst the gateway in sync.
const retryDelay = (attempt: number) =>
  Math.min(500 * 2 ** attempt, 4000) + Math.random() * 250;

const useIPFS = <T>(
  uri?: string | null | false,
): [T | undefined, Error | null] => {
  const { data, error } = useQuery<T>({
    queryKey: ["ipfs", uri || null],
    queryFn: () => ipfsFetch<T>(uri as string),
    enabled: Boolean(uri),
    staleTime: Infinity,
    retry: RETRY_COUNT,
    retryDelay,
  });

  return [data, error];
};

export const useSuspenseIPFS = <T>(
  uri?: string | null | false,
): [T | undefined, Error | null] => {
  const { data, error } = useSuspenseQuery<T | null>({
    queryKey: ["ipfs", uri || null],
    queryFn: () => (uri ? ipfsFetch<T>(uri) : Promise.resolve(null)),
    staleTime: Infinity,
    retry: RETRY_COUNT,
    retryDelay,
  });

  return [data ?? undefined, error];
};

export default useIPFS;
