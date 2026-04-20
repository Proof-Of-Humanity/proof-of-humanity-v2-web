import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WriteArgs,
  WriteFunctionName,
  Effects,
  WriteSuccessContext,
} from "./types";
import { SupportedChainId } from "config/chains";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import useChainParam from "hooks/useChainParam";
import { getContractInfo, ContractName } from "contracts";
import { Abi, Hash, ParseAbiParameter, toBytes, zeroAddress } from "viem";

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
  const { data: receipt, status: transactionStatus } =
    useWaitForTransactionReceipt({
      hash: submittedTx?.hash,
      chainId: submittedTx?.chainId,
    });
  const effectsRef = useRef(effects);
  const lastWriteRef = useRef<{
    args?: readonly unknown[];
    value?: bigint;
    chainId: number;
  } | null>(null);
  const lastPendingHashRef = useRef<Hash | undefined>();
  const lastSuccessHashRef = useRef<Hash | undefined>();

  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  const fireWrite = useCallback(
    (request: any) => {
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
        .catch(() => undefined);
    },
    [args, value, currentChainId, writeContractAsync],
  );

  useEffect(() => {
    switch (prepareStatus) {
      case "success":
        if (prepared.request && enabled) {
          effectsRef.current?.onReady?.(() => fireWrite(prepared.request));
          setEnabled(false);
        }
        break;
      case "error":
        if (enabled) {
          effectsRef.current?.onFail?.(prepareError);
          setEnabled(false);
        }
    }
  }, [prepareStatus, enabled, prepared?.request, prepareError, fireWrite]);

  useEffect(() => {
    switch (status) {
      case "error":
        effectsRef.current?.onError?.(writeError);
        setEnabled(false);
    }
  }, [status, writeError]);

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
      case "success":
        if (lastSuccessHashRef.current !== txHash) {
          lastSuccessHashRef.current = txHash;
          const ctx: WriteSuccessContext = {
            contract,
            functionName: String(functionName),
            args: lastWriteRef.current?.args,
            value: lastWriteRef.current?.value,
            chainId: lastWriteRef.current?.chainId ?? currentChainId,
            txHash,
            receipt,
          };
          effectsRef.current?.onSuccess?.(ctx);
        }
        break;
    }
  }, [
    transactionStatus,
    submittedTx?.hash,
    receipt,
    contract,
    functionName,
    currentChainId,
  ]);

  const prepare = useCallback(
    (params: { value?: bigint; args?: WriteArgs<C, F> } = {}) => {
      if (params.value !== undefined) setValue(params.value);
      if (params.args) setArgs(params.args);
      setEnabled(true);
    },
    [],
  );

  const firePrepared = useCallback(() => {
    if (prepared?.request) {
      fireWrite(prepared.request);
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
