import { useEffect, useMemo, useState } from "react";
import { WriteArgs, WriteFunctionName, Effects } from "./types";
import { SupportedChainId } from "config/chains";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import abis from "contracts/abis";
import useChainParam from "hooks/useChainParam";
import { Contract, ContractName } from "contracts";
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
  const abiFragment = (abis[contract] as Abi).find(
    (item) => item.type === "function" && item.name === functionName,
  );
  const [value, setValue] = useState(0n);
  const [args, setArgs] = useState(
    defaultForInputs((abiFragment as any).inputs) as WriteArgs<C, F>,
  );
  
  const [enabled, setEnabled] = useState(false);

  const chain = useChainParam();
  const defaultChainId = useChainId() as SupportedChainId;

  const { data: prepared, status: prepareStatus} = useSimulateContract({
   address: Contract[contract][chain?.id || defaultChainId] as `0x${string}`,
    abi: abis[contract] as Abi,
    functionName,
    chainId: chain?.id || defaultChainId,
    value,
   args,
    query : {
      enabled
    }
  } as any);

  const { writeContract, data, status, reset: resetWrite } = useWriteContract();
  const { status: transactionStatus } = useWaitForTransactionReceipt({
    hash: data
  });

  useEffect(() => {
    switch (prepareStatus) {
      case "success":
        if (prepared.request && enabled) {
          effects?.onReady?.(() => writeContract(prepared.request));
          setEnabled(false);
        }
        break;
      case "error":
        if(enabled){
        effects?.onFail?.();
        setEnabled(false);
        }
        break;
    }
  }, [prepareStatus, effects, enabled,prepared?.request, writeContract]);

  useEffect(() => {
    if (status === "error") {
      effects?.onError?.();
      setEnabled(false);
      resetWrite();
    }
  }, [status, effects, resetWrite]);

  useEffect(() => {
    if (data) {
      switch (transactionStatus) {
        case "pending":
          effects?.onLoading?.();
          break;
        case "success":
          effects?.onSuccess?.();
          resetWrite();
          break;
      }
    }
  }, [transactionStatus, effects, data, resetWrite]);

  return useMemo(
    () =>
      [
        (params: { value?: bigint; args?: WriteArgs<C, F> } = {}) => {
          if (params.value) setValue(params.value);
          if (params.args) setArgs(params.args);
          setEnabled(true);
        },
        () => {
          if(prepared?.request)
          writeContract(prepared.request);
          setEnabled(false);
        },
        {
          prepare: prepareStatus,
          write: status,
          transaction: transactionStatus,
        },
      ] as const,
    [prepareStatus, status, transactionStatus, prepared?.request, writeContract],
  );
}
