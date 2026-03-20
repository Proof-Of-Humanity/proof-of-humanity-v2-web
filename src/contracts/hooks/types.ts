import { ContractName, contractRegistry } from "contracts";
import {
  ContractFunctionArgs,
  Hash,
  ReadContractParameters,
  ReadContractReturnType,
  TransactionReceipt,
  WriteContractParameters,
} from "viem";

export type ContractAbi<C extends ContractName> = (typeof contractRegistry)[C]['abi'];

export type ReadFunctionName<C extends ContractName> = ReadContractParameters<
  ContractAbi<C>
>["functionName"];
export type ReadArgs<
  C extends ContractName,
  F extends ReadFunctionName<C>,
> = ReadContractParameters<ContractAbi<C>, F>["args"];
export type ReadFunctionReturn<
  C extends ContractName,
  F extends ReadFunctionName<C>,
> = ReadContractReturnType<ContractAbi<C>, F>;

export type WriteFunctionName<C extends ContractName> = WriteContractParameters<
  ContractAbi<C>
>["functionName"];
export type WriteArgs<
  C extends ContractName,
  F extends WriteFunctionName<C>,
> = ContractFunctionArgs<ContractAbi<C>, "nonpayable" | "payable", F>;

export interface WriteSuccessContext {
  contract: ContractName;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  chainId: number;
  txHash?: Hash;
  receipt?: TransactionReceipt;
}

export interface Effects {
  onLoading?: () => void;
  onError?: (error?: unknown) => void;
  onFail?: (error?: unknown) => void;
  onSuccess?: (ctx: WriteSuccessContext) => void;
  onReady?: (fire: () => void) => void;
}

// Batch transaction types
export type BatchCall<
  C extends ContractName = ContractName,
  F extends WriteFunctionName<C> = WriteFunctionName<C>
> = {
  contract: C;
  functionName: F;
  args: WriteArgs<C, F>;
  value?: bigint;
};

export type BatchWriteParams = {
  calls: BatchCall[];
  value?: bigint;
};
