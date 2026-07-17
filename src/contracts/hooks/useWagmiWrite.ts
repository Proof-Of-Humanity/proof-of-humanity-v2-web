import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WriteArgs,
  WriteFunctionName,
  Effects,
  WriteSuccessContext,
} from "./types";
import { SupportedChainId } from "config/chains";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import useChainParam from "hooks/useChainParam";
import { getContractInfo, ContractName } from "contracts";
import {
  Abi,
  BaseError,
  Hash,
  ParseAbiParameter,
  toBytes,
  zeroAddress,
} from "viem";

const defaultForInputs = (inputs: readonly ParseAbiParameter<string>[]) =>
  inputs.length
    ? inputs.map((inp) => {
        if (inp.type.endsWith("[]")) return [];
        if (inp.type === "address") return zeroAddress;
        if (inp.type === "bool") return false;
        if (inp.type === "string") return "";
        if (inp.type.startsWith("uint")) return 0n;
        if (inp.type.startsWith("bytes")) return toBytes(0);
        if (inp.type.startsWith("int")) return 0n;
        throw new Error("Abi error");
      })
    : undefined;

export default function useWagmiWrite<
  C extends ContractName,
  F extends WriteFunctionName<C>,
>(contract: C, functionName: F, effects?: Effects) {
  const chain = useChainParam();
  const { address } = useAccount();
  const defaultChainId = useChainId() as SupportedChainId;
  const currentChainId = (chain?.id || defaultChainId) as SupportedChainId;
  const contractInfo = getContractInfo(contract, currentChainId);
  const abiFragment = (contractInfo.abi as Abi).find(
    (item) => item.type === "function" && item.name === functionName,
  );
  const [value, setValue] = useState(0n);
  const [args, setArgs] = useState(
    defaultForInputs((abiFragment as any).inputs) as WriteArgs<C, F>,
  );
  const [submittedTx, setSubmittedTx] = useState<
    { hash: Hash; chainId: SupportedChainId } | undefined
  >();
  const [enabled, setEnabled] = useState(false);

  const {
    data: prepared,
    status: prepareStatus,
    error: prepareError,
  } = useSimulateContract({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi as Abi,
    functionName,
    chainId: chain?.id || defaultChainId,
    value,
    args,
    query: {
      enabled,
    },
  } as any);

  const { writeContractAsync, status, error: writeError } = useWriteContract();
  const {
    data: receipt,
    status: transactionStatus,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash: submittedTx?.hash,
    chainId: submittedTx?.chainId,
  });
  const effectsRef = useRef(effects);
  const lastWriteRef = useRef<{
    args?: readonly unknown[];
    value?: bigint;
    chainId: number;
  } | null>(null);
  const preparedRequestRef = useRef<any>();
  const writeInFlightRef = useRef(false);
  const lastPendingHashRef = useRef<Hash | undefined>();
  const lastSettledHashRef = useRef<Hash | undefined>();
  const lastUnknownHashRef = useRef<Hash | undefined>();

  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  useEffect(() => {
    preparedRequestRef.current = undefined;
  }, [address, defaultChainId, currentChainId, contractInfo.address]);

  const fireWrite = useCallback(
    (request: any) => {
      if (writeInFlightRef.current) return;
      writeInFlightRef.current = true;
      const writeChainId =
        (request?.chain?.id as SupportedChainId | undefined) ?? currentChainId;
      lastWriteRef.current = {
        args: args as readonly unknown[] | undefined,
        value,
        chainId: writeChainId,
      };
      setSubmittedTx(undefined);
      void writeContractAsync(request)
        .then((hash) => {
          setSubmittedTx({ hash, chainId: writeChainId });
        })
        .catch(() => {
          writeInFlightRef.current = false;
        });
    },
    [args, value, currentChainId, writeContractAsync],
  );

  useEffect(() => {
    switch (prepareStatus) {
      case "success":
        if (prepared.request && enabled) {
          preparedRequestRef.current = prepared.request;
          effectsRef.current?.onReady?.(() => fireWrite(prepared.request));
          setEnabled(false);
        }
        break;
      case "error":
        if (enabled) {
          preparedRequestRef.current = undefined;
          effectsRef.current?.onFail?.(prepareError);
          setEnabled(false);
        }
    }
  }, [prepareStatus, enabled, prepared?.request, prepareError, fireWrite]);

  useEffect(() => {
    switch (status) {
      case "error":
        writeInFlightRef.current = false;
        effectsRef.current?.onError?.(writeError, { kind: "wallet" });
        setEnabled(false);
    }
  }, [status, writeError]);

  // Settle each submitted tx exactly once, through either `onSuccess` or
  // `onError` — callers key their loading/lock state off that guarantee.
  useEffect(() => {
    const txHash = submittedTx?.hash;
    if (!txHash) return;

    switch (transactionStatus) {
      case "pending":
        if (lastPendingHashRef.current !== txHash) {
          lastPendingHashRef.current = txHash;
          effectsRef.current?.onLoading?.();
        }
        break;
      case "success": {
        if (lastSettledHashRef.current === txHash) break;
        lastSettledHashRef.current = txHash;
        writeInFlightRef.current = false;
        const ctx: WriteSuccessContext = {
          contract,
          functionName: String(functionName),
          args: lastWriteRef.current?.args,
          value: lastWriteRef.current?.value,
          chainId: lastWriteRef.current?.chainId ?? currentChainId,
          // A sped-up (repriced) tx confirms under a different hash, and the
          // wait resolves with that replacement receipt.
          txHash: receipt?.transactionHash ?? txHash,
          receipt,
        };
        effectsRef.current?.onSuccess?.(ctx);
        break;
      }
      case "error": {
        if (transactionError instanceof BaseError) {
          if (lastUnknownHashRef.current !== txHash) {
            lastUnknownHashRef.current = txHash;
            effectsRef.current?.onError?.(transactionError, {
              kind: "unknown",
              txHash,
            });
          }
          break;
        }
        if (lastSettledHashRef.current === txHash) break;
        lastSettledHashRef.current = txHash;
        writeInFlightRef.current = false;
        effectsRef.current?.onError?.(transactionError, {
          kind: "reverted",
          txHash,
        });
        break;
      }
    }
  }, [
    transactionStatus,
    transactionError,
    submittedTx?.hash,
    receipt,
    contract,
    functionName,
    currentChainId,
  ]);

  const prepare = useCallback(
    (params: { value?: bigint; args?: WriteArgs<C, F> } = {}) => {
      preparedRequestRef.current = undefined;
      if (params.value !== undefined) setValue(params.value);
      if (params.args) setArgs(params.args);
      setEnabled(true);
    },
    [],
  );

  const firePrepared = useCallback(() => {
    const preparedRequest = preparedRequestRef.current ?? prepared?.request;
    if (preparedRequest) {
      fireWrite(preparedRequest);
    }
    setEnabled(false);
  }, [prepared?.request, fireWrite]);

  const writeStatus = useMemo(
    () => ({
      prepare: prepareStatus,
      write: status,
      transaction: transactionStatus,
    }),
    [prepareStatus, status, transactionStatus],
  );

  return [prepare, firePrepared, writeStatus] as const;
}
