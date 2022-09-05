import useSWR from "swr";
import useKeepBlockDataLive from "./useKeepBlockDataLive";
import useWeb3 from "./useWeb3";

const useBalance = (suspense = false) => {
  const { account, provider, chainId } = useWeb3(false);

  const result = useSWR(
    account && !!provider ? ["ETHBalance", account, chainId] : null,
    async (_: string, address: string) => await provider!.getBalance(address),
    { suspense }
  );

  useKeepBlockDataLive(result.mutate);

  return result.data;
};

export default useBalance;
