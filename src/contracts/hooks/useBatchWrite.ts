import { useEffect, useMemo, useState } from "react";
import { useCapabilities, useSendCalls, useChainId, useCallsStatus } from "wagmi";
import { encodeFunctionData, } from "viem";
import { getContractInfo } from "contracts/registry";
import { BatchCall, BatchWriteParams, Effects } from "./types";

export default function useBatchWrite(effects?: Effects) {
  // State
  const [calls, setCalls] = useState<BatchCall[]>([]);
  const [enabled, setEnabled] = useState(false);
  const chainId = useChainId();

  const { data: capabilities, isLoading: isCapabilitiesLoading } = useCapabilities();
  console.log(capabilities);

  const supportsBatchingTransaction = useMemo(
    () =>
      capabilities?.[chainId]?.atomic?.status === "ready" ||
      capabilities?.[chainId]?.atomic?.status === "supported",
    [capabilities, chainId]
  );
  console.log(supportsBatchingTransaction);

  // Native batch hooks
  const {
    sendCalls,
    status: sendStatus,
    data: sendData,
    error: sendError
  } = useSendCalls();

  const { data: callReceipts, error: callReceiptsError } = useCallsStatus({
    id: sendData?.id || "",
    query: {
      enabled: !!sendData?.id,
      refetchInterval: 100
    }
  });

  const writeStatus = (
    callReceipts?.status === "pending" || sendStatus === "pending"
      ? "pending"
      : callReceipts?.status === "success" && sendStatus === "success"
        ? "success"
        : callReceipts?.status === "failure" || sendStatus === "error"
          ? "error"
          : "idle"
  );

  // Prepare batch calls for multiple contracts
  const batchCallsData = useMemo(() => {
    if (!calls.length || !chainId) return [];

    return calls.map(call => {
      const { address, abi } = getContractInfo(call.contract, chainId);

      return {
        to: address as `0x${string}`,
        data: encodeFunctionData({
          abi,
          functionName: call.functionName,
          args: call.args,
        }),
        value: call.value || 0n,
      };
    });
  }, [calls, chainId]);

  useEffect(() => {
    if (!enabled || isCapabilitiesLoading) return;

    if (!supportsBatchingTransaction) {
      effects?.onFail?.(new Error("Wallet doesn't support atomic batch transactions (ERC-5792)"));
      setEnabled(false);
      return;
    }
    if (batchCallsData.length > 0) {
      effects?.onReady?.(() => {
        sendCalls({ calls: batchCallsData });
        setEnabled(false);
      });
    }
  }, [enabled, isCapabilitiesLoading, supportsBatchingTransaction, batchCallsData, sendCalls, effects]);

  // Effects - Status tracking
  useEffect(() => {
    if (!supportsBatchingTransaction) return;

    switch (writeStatus) {
      case "pending":
        effects?.onLoading?.();
        break;
      case "success":
        effects?.onSuccess?.();
        break;
      case "error":
        effects?.onError?.(callReceiptsError || sendError);
        break;
    }
  }, [supportsBatchingTransaction, effects, writeStatus]);

  // Public API
  const prepare = ({ calls: newCalls }: BatchWriteParams) => {
    setCalls(newCalls);
    setEnabled(true);
  };

  const fire = () => {
    if (batchCallsData.length > 0 && supportsBatchingTransaction) {
      sendCalls({ calls: batchCallsData });
      setEnabled(false);
    }
  };

  // Status mapping
  const prepareStatus = isCapabilitiesLoading
    ? "idle"
    : supportsBatchingTransaction && batchCallsData.length > 0
      ? "success"
      : !supportsBatchingTransaction
        ? "error"
        : "idle";

  return [
    prepare,
    fire,
    {
      prepare: prepareStatus,
      write: writeStatus,
    },
  ] as const;
} 