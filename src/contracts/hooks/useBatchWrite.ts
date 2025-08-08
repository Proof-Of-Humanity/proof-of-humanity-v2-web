import { useEffect, useMemo, useState } from "react";
import { useCapabilities, useSendCalls, useChainId } from "wagmi";
import { encodeFunctionData,  } from "viem";
import { getContractInfo } from "contracts/registry";
import { BatchCall, BatchWriteParams, Effects } from "./types";
import useChainParam from "hooks/useChainParam";

// TODO: Simulate before sending
export default function useBatchWrite(effects?: Effects) {
  // State
  const [calls, setCalls] = useState<BatchCall[]>([]);
  const [enabled, setEnabled] = useState(false);
  const chainId = useChainId();
  
  // Chain & capabilities
  const chain = useChainParam();
  const { data: capabilities } = useCapabilities();
  const supportsBatchingTransaction = useMemo(() => capabilities?.[chainId]?.atomic?.status === "ready" 
  || capabilities?.[chainId]?.atomic?.status === "supported", [capabilities, chainId])
  
  // Native batch hooks
  const { 
    sendCalls, 
    status: sendStatus,
    error: sendError 
  } = useSendCalls();

  // Prepare batch calls for multiple contracts
  const batchCallsData = useMemo(() => {
    if (!calls.length || !chain) return [];
    
    return calls.map(call => {
      const { address, abi } = getContractInfo(call.contract, chain.id);
      
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
  }, [calls, chain]);

  // Effects - Capability check & prepare
  useEffect(() => {
    if (!enabled) return;
    
    if (!supportsBatchingTransaction) {
      effects?.onFail?.(); // Wallet doesn't support batch
      setEnabled(false);
      return;
    }
    
    if (batchCallsData.length > 0) {
      effects?.onReady?.(() => {
        sendCalls({ calls: batchCallsData });
        setEnabled(false);
      });
    }
  }, [enabled, supportsBatchingTransaction, batchCallsData, sendCalls, effects]);

  // Effects - Error handling
  useEffect(() => {
    if (sendError) {
      effects?.onError?.();
    }
  }, [sendError, effects]);

  // Effects - Status tracking
  useEffect(() => {
    if (!supportsBatchingTransaction) return;
    
    switch (sendStatus) {
      case "pending":
        effects?.onLoading?.();
        break;
      case "success":
        effects?.onSuccess?.();
        break;
    }
  }, [supportsBatchingTransaction, effects, sendStatus]);

  // Public API
  const prepare = ({ calls: newCalls }: BatchWriteParams) => {
    setCalls(newCalls);
    setEnabled(true);
  };

  const fire = () => {
    if (batchCallsData.length > 0 && supportsBatchingTransaction) {
      sendCalls({ calls: batchCallsData });
    }
  };

  // Status mapping
  const prepareStatus = supportsBatchingTransaction && batchCallsData.length > 0 ? "success" : 
                       !supportsBatchingTransaction ? "error" : "idle";

  return [
    prepare,
    fire,
    {
      prepare: prepareStatus,
      write: sendStatus,
    },
  ] as const;
} 