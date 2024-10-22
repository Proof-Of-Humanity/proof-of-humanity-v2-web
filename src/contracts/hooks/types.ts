import { ContractName } from "contracts";
import abis from "contracts/abis";
import {
  ReadContractParameters,
  ReadContractReturnType,
  WriteContractParameters,
} from "viem";

export type ContractAbi<C extends ContractName> = (typeof abis)[C];

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
> = WriteContractParameters<ContractAbi<C>, F>["args"];

export interface Effects {
  onLoading?: () => void;
  onError?: () => void;
  onFail?: () => void;
  onSuccess?: () => void;
  onReady?: (fire: () => void) => void;
}
