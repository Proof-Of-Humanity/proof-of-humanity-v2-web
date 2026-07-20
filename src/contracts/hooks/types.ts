import { ContractName, contractRegistry } from "contracts";
import {
  ContractFunctionArgs,
  Hash,
  TransactionReceipt,
  WriteContractParameters,
} from "viem";

export type ContractAbi<C extends ContractName> =
  (typeof contractRegistry)[C]["abi"];

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

/**
 * Why a submitted write terminally failed:
 * - `wallet`: rejected or failed at submission, never reached the chain.
 * - `reverted`: mined and reverted on-chain.
 * - `unknown`: the receipt lookup kept failing after retries; the outcome is
 *   unverified and the tx may still have confirmed. Verify via `txHash`
 *   before retrying — the UI converges through the normal data refetch.
 */
export type WriteErrorKind = "wallet" | "reverted" | "unknown";

export interface WriteErrorContext {
  kind: WriteErrorKind;
  txHash?: Hash;
}

export interface Effects {
  onLoading?: () => void;
  /**
   * Terminal notification for every write that does not reach `onSuccess`.
   * Exactly one of `onSuccess`/`onError` fires per submitted transaction, so
   * callers can rely on it to release loading/lock state.
   */
  onError?: (error?: unknown, errorCtx?: WriteErrorContext) => void;
  onFail?: (error?: unknown) => void;
  onSuccess?: (ctx: WriteSuccessContext) => void;
  onReady?: (fire: () => void) => void;
}

// Batch transaction types
export type BatchCall<
  C extends ContractName = ContractName,
  F extends WriteFunctionName<C> = WriteFunctionName<C>,
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
