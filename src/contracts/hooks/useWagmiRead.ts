import { ReadArgs, ReadFunctionName, ReadFunctionReturn } from "./types";
import { SupportedChainId } from "config/chains";
import { useChainId, useContractRead } from "wagmi";
import abis from "contracts/abis";
import { Abi } from "viem";
import { Contract, ContractName } from "contracts";

export default function useWagmiRead<
  C extends ContractName,
  F extends ReadFunctionName<C>,
>(contract: C, functionName: F, args?: ReadArgs<C, F>) {
  const chainId = useChainId() as SupportedChainId;
  const { data, isLoading, isError, isSuccess } = useContractRead({
    address: Contract[contract][chainId] as `0x${string}`,
    abi: abis[contract] as Abi,
    functionName: functionName as string,
    args: args as unknown[],
  });

  return [
    data as ReadFunctionReturn<C, F>,
    { isLoading, isError, isSuccess },
  ] as const;
}
