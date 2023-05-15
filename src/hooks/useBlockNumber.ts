import { BrowserProvider } from "ethers";
import useSWR from "swr";
import useWeb3 from "./useWeb3";

const getBlockNumber = (provider: BrowserProvider) => async () =>
  provider.getBlockNumber();

export default function useBlockNumber() {
  const { library } = useWeb3();

  const { data } = useSWR(
    !!library ? "block-number" : null,
    getBlockNumber(library!),
    { refreshInterval: 10 * 1000 }
  );

  return data;
}
