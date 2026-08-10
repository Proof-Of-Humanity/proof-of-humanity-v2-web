import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useAtlasProvider } from "@kleros/kleros-app";

export default function useIsSubscribed() {
  const { address } = useAccount();
  const { checkIsSubscribed } = useAtlasProvider();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["isSubscribed", address],
    queryFn: () => {
      if (!address) throw new Error("Wallet not connected");
      return checkIsSubscribed(address);
    },
    enabled: !!address,
  });

  return { isSubscribed: data, isLoading, refetch };
}
