import { skipToken, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useAtlasProvider } from "@kleros/kleros-app";

export default function useIsSubscribed() {
  const { address } = useAccount();
  const { checkIsSubscribed } = useAtlasProvider();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["isSubscribed", address],
    queryFn: address ? () => checkIsSubscribed(address) : skipToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { isSubscribed: data, isLoading, isError };
}
