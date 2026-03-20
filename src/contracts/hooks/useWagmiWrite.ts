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
import { Abi, ParseAbiParameter, toBytes, zeroAddress } from "viem";

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
  const contractInfo = getContractInfo(contract, chain?.id || defaultChainId);
  const abiFragment = (contractInfo.abi as Abi).find(
    (item) => item.type === "function" && item.name === functionName,
  );
  const [value, setValue] = useState(0n);
  const [args, setArgs] = useState(
    defaultForInputs((abiFragment as any).inputs) as WriteArgs<C, F>,
  );

  const [enabled, setEnabled] = useState(false);

  const { data: prepared, status: prepareStatus } = useSimulateContract({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi as Abi,
    functionName,
    chainId: chain?.id || defaultChainId,
    value,
    args,
    query: {
      enabled
    }
  } as any);

  const { writeContract, data, status, error: writeError } = useWriteContract();
  const { data: receipt, status: transactionStatus } = useWaitForTransactionReceipt({
    hash: data,
  });
  const lastWriteRef = useRef<{
    args?: readonly unknown[];
    value?: bigint;
    chainId: number;
  } | null>(null);
  const lastPendingHashRef = useRef<typeof data>();
  const lastSuccessHashRef = useRef<typeof data>();

  const fireWrite = useCallback(
    (request: any) => {
      lastWriteRef.current = {
        args: args as readonly unknown[] | undefined,
        value,
        chainId: chain?.id || defaultChainId,
      };
      writeContract(request);
    },
    [args, value, chain?.id, defaultChainId, writeContract],
  );

  useEffect(() => {
    switch (prepareStatus) {
      case "success":
        if (prepared.request && enabled) {
          effects?.onReady?.(() => fireWrite(prepared.request));
          setEnabled(false);
        }
        break;
      case "error":
        if (enabled) {
          effects?.onFail?.();
          setEnabled(false);
        }
    }
  }, [prepareStatus, effects, enabled, prepared?.request, fireWrite]);

  useEffect(() => {
    switch (status) {
      case "error":
        console.log(writeError);
        effects?.onError?.(writeError);
        setEnabled(false);
    }
  }, [status, effects, writeError]);

  useEffect(() => {
    if (!data) return;

    switch (transactionStatus) {
      case "pending":
        if (lastPendingHashRef.current !== data) {
          lastPendingHashRef.current = data;
          effects?.onLoading?.();
        }
        break;
      case "success":
        if (lastSuccessHashRef.current !== data) {
          lastSuccessHashRef.current = data;
          const ctx: WriteSuccessContext = {
            contract,
            functionName: String(functionName),
            args: lastWriteRef.current?.args,
            value: lastWriteRef.current?.value,
            chainId: lastWriteRef.current?.chainId ?? (chain?.id || defaultChainId),
            txHash: data,
            receipt,
          };
          effects?.onSuccess?.(ctx);
        }
        break;
    }
  }, [
    transactionStatus,
    effects,
    data,
    receipt,
    contract,
    functionName,
    chain?.id,
    defaultChainId,
  ]);

  return useMemo(
    () =>
      [
        (params: { value?: bigint; args?: WriteArgs<C, F> } = {}) => {
          if (params.value !== undefined) setValue(params.value);
          if (params.args) setArgs(params.args);
          setEnabled(true);
        },
        () => {
          if (prepared?.request)
            fireWrite(prepared.request);
          setEnabled(false);
        },
        {
          prepare: prepareStatus,
          write: status,
          transaction: transactionStatus,
        },
      ] as const,
    [prepareStatus, status, transactionStatus, prepared?.request, fireWrite],
  );
}
