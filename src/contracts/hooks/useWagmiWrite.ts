import { useEffect, useMemo, useState } from "react";
import { WriteArgs, WriteFunctionName, Effects } from "./types";
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

  const { data: prepared, status: prepareStatus, error: prepareError} = useSimulateContract({
   address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi as Abi,
    functionName,
    chainId: chain?.id || defaultChainId,
    value,
   args,
    query : {
      enabled
    }
  } as any);

  const { writeContract, data, status} = useWriteContract();
  const { status: transactionStatus } = useWaitForTransactionReceipt({
    hash: data,
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
          console.error(prepareError);
          effects?.onFail?.();
          setEnabled(false);
        }
    }
  }, [prepareStatus, effects, enabled, prepared?.request, writeContract]);

  useEffect(() => {
    switch (status) {
      case "error":
        effects?.onError?.();
        setEnabled(false);
    }
  }, [status, effects]);

  useEffect(() => {
    if(data) {
      switch (transactionStatus) {
        case "pending":
          effects?.onLoading?.();
          break;
        case "success":
          effects?.onSuccess?.();
      }
    }
  }, [transactionStatus, effects]);

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
