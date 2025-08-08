import { ReadArgs, ReadFunctionName, ReadFunctionReturn } from "./types";
import { SupportedChainId } from "config/chains";
import { useChainId, useReadContract } from "wagmi";
import { Abi } from "viem";
import { getContractInfo, ContractName } from "contracts";

export default function useWagmiRead<
  C extends ContractName,
  F extends ReadFunctionName<C>,
>(contract: C, functionName: F, args?: ReadArgs<C, F>) {
  const chainId = useChainId() as SupportedChainId;
  const contractInfo = getContractInfo(contract, chainId);
  const { data, isLoading, isError, isSuccess } = useReadContract({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi as Abi,
    functionName: functionName as string,
    args: args as unknown[],
  });

  return [
    data as ReadFunctionReturn<C, F>,
    { isLoading, isError, isSuccess },
  ] as const;
}
