"use client";

import ChainLogo from "components/ChainLogo";
import Modal from "components/Modal";
import TimeAgo from "components/TimeAgo";
import LoadingSpinner from "components/Integrations/Circles/LoadingSpinner";
import {
  SupportedChain,
  SupportedChainId,
  getChainRpc,
  getForeignChain,
  idToChain,
  supportedChains,
} from "config/chains";
import { CreationBlockNumber } from "contracts";

import { getContractInfo } from "contracts";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import useRelayWrite from "contracts/hooks/useRelayWrite";
import { ContractData } from "data/contract";
import { HumanityQuery } from "generated/graphql";
import { sdk } from "config/subgraph";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { timeAgo } from "utils/time";
import { Address, Hash, createPublicClient, http, decodeEventLog, TransactionReceipt, Log } from "viem";
import { mainnet, sepolia, gnosisChiado } from "viem/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useProfileOptimistic } from "optimistic/profile";
import type { ProfileOptimisticOverlay } from "optimistic/types";

// Define minimal ABI for UserRequestForSignature (Home -> Foreign)
const USER_REQUEST_FOR_SIGNATURE_ABI = [{
  anonymous: false,
  inputs: [
    { indexed: true, name: "messageId", type: "bytes32" },
    { indexed: false, name: "encodedData", type: "bytes" },
  ],
  name: "UserRequestForSignature",
  type: "event",
}] as const;

type AMBMessageInfo = {
  messageId: Hash;
  encodedData: `0x${string}`;
  type: 'UserRequestForSignature' | 'UserRequestForAffirmation';
} | null;

const isReceiptPendingError = (error: unknown) =>
  error instanceof Error &&
  error.name === "TransactionReceiptNotFoundError";

export const buildTransferSuccessPatch = (): ProfileOptimisticOverlay => ({
  winningStatus: "transferring",
});

export const buildUpdateSuccessPatch = (): ProfileOptimisticOverlay => ({
  pendingUpdate: true,
});

function findClosestLog(
  logs: Log[],
  targetLogIndex: number,
  matcher: (log: Log) => boolean,
  preferBefore = false,
): Log | undefined {
  const matchingLogs = logs.filter(matcher);

  if (!matchingLogs.length) {
    return undefined;
  }

  if (preferBefore) {
    const closestBefore = matchingLogs
      .filter((log) => Number(log.logIndex) < targetLogIndex)
      .sort((logA, logB) => Number(logB.logIndex) - Number(logA.logIndex))[0];

    if (closestBefore) {
      return closestBefore;
    }
  }

  return matchingLogs.sort(
    (logA, logB) =>
      Math.abs(Number(logA.logIndex) - targetLogIndex) -
      Math.abs(Number(logB.logIndex) - targetLogIndex),
  )[0];
}

function getUpdateExpiration(txReceipt: TransactionReceipt, chainId: SupportedChainId): bigint | undefined {
  let expirationTime: bigint | undefined;
  txReceipt.logs.find((log: Log) => {
    try {
      const decoded = decodeEventLog({
        abi: getContractInfo("CrossChainProofOfHumanity", chainId).abi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "UpdateInitiated") {
          // @ts-ignore
          expirationTime = decoded.args.expirationTime as bigint;
          return true;
      }
      return false;
    } catch {
      return false;
    }
  });
  return expirationTime;
}

function getAMBMessageInfo(
  txReceipt: TransactionReceipt,
  chainId: SupportedChainId,
  updateLogIndex?: number,
): AMBMessageInfo {
    const isGnosisChain = chainId === 100 || chainId === 10200; // Gnosis or Chiado

    if (isGnosisChain) {
      const ambEvent = typeof updateLogIndex === "number"
        ? findClosestLog(
            txReceipt.logs,
            updateLogIndex,
            (log: Log) => {
              try {
                const decoded = decodeEventLog({
                  abi: USER_REQUEST_FOR_SIGNATURE_ABI,
                  data: log.data,
                  topics: log.topics,
                });
                return decoded.eventName === "UserRequestForSignature";
              } catch {
                return false;
              }
            },
            true,
          )
        : txReceipt.logs.find((log: Log) => {
            try {
              const decoded = decodeEventLog({
                abi: USER_REQUEST_FOR_SIGNATURE_ABI,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "UserRequestForSignature";
            } catch {
              return false;
            }
          });

      if (ambEvent) {
         const decoded = decodeEventLog({
            abi: USER_REQUEST_FOR_SIGNATURE_ABI,
            data: ambEvent.data,
            topics: ambEvent.topics,
          });
          const messageId = decoded.args.messageId as Hash;
          const encodedData = decoded.args.encodedData as `0x${string}`;
          return { messageId, encodedData, type: 'UserRequestForSignature' };
      }
    } else {
      // Ethereum -> Gnosis: Look for UserRequestForAffirmation (Foreign AMB)
    const ambAbi = getContractInfo("EthereumAMBBridge", chainId)?.abi;
    if (!ambAbi) {
      return null;
    }

      const ambEvent = typeof updateLogIndex === "number"
        ? findClosestLog(
            txReceipt.logs,
            updateLogIndex,
            (log: Log) => {
              try {
                const decoded = decodeEventLog({
                  abi: ambAbi,
                  data: log.data,
                  topics: log.topics,
                });
                return decoded.eventName === "UserRequestForAffirmation";
              } catch {
                return false;
              }
            },
            true,
          )
        : txReceipt.logs.find((log: Log) => {
            try {
              const decoded = decodeEventLog({
                abi: ambAbi,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "UserRequestForAffirmation";
            } catch {
              return false;
            }
          });

      if (ambEvent) {
        const decoded = decodeEventLog({
          abi: ambAbi,
          data: ambEvent.data,
          topics: ambEvent.topics,
        });
        // @ts-ignore 
        const messageId = decoded.args.messageId as Hash;
        // @ts-ignore
        const encodedData = decoded.args.encodedData as `0x${string}`;
        return { messageId, encodedData, type: 'UserRequestForAffirmation' };
      }
    }
    
    return null;
}

function getRelayedMessageId(
  txReceipt: TransactionReceipt,
  chainId: SupportedChainId,
  updateLogIndex?: number,
): Hash | null {
    const ambAbi = getContractInfo("EthereumAMBBridge", chainId)?.abi;
    
    // 1. Try robust ABI decoding first
    if (ambAbi) {
      const relayedEvent = typeof updateLogIndex === "number"
        ? findClosestLog(txReceipt.logs, updateLogIndex, (log: Log) => {
            try {
              const decoded = decodeEventLog({
                abi: ambAbi,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "RelayedMessage";
            } catch {
              return false;
            }
          })
        : txReceipt.logs.find((log: Log) => {
            try {
              const decoded = decodeEventLog({
                abi: ambAbi,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "RelayedMessage";
            } catch {
              return false;
            }
          });

      if (relayedEvent) {
          const decoded = decodeEventLog({
              abi: ambAbi,
              data: relayedEvent.data,
              topics: relayedEvent.topics,
          });
          // @ts-ignore
          return decoded.args.messageId as Hash;
      }
    }

    // 2. Fallback to hardcoded index logic (legacy/testnets strategy)
    try {
        if (typeof updateLogIndex === "number") {
          const nearbyLog = findClosestLog(
            txReceipt.logs,
            updateLogIndex + 1,
            (log: Log) => log.topics.length >= 4,
          );

          if (nearbyLog?.topics?.[3]) {
            return nearbyLog.topics[3] as Hash;
          }
        }

        const eventIndex = (chainId === 1 || chainId === 11155111) ? 1 : 2;
        const log = txReceipt.logs.at(eventIndex);
        if (log?.topics?.[3]) {
            return log.topics[3] as Hash;
        }
    } catch (e) {
        console.warn('Fallback RelayedMessage extraction failed', e);
    }

    return null;
}

interface CrossChainProps {
  contractData: Record<SupportedChainId, ContractData>;
  humanity: Record<SupportedChainId, HumanityQuery>;
  claimer: Address;
  homeChain: SupportedChain;
  pohId: Hash;
  lastTransfer: HumanityQuery["outTransfer"];
  lastTransferChain?: SupportedChain;
}

export default function CrossChain({
  pohId,
  contractData,
  humanity,
  claimer,
  homeChain,
  lastTransfer,
  lastTransferChain,
}: CrossChainProps) {
  const { address } = useAccount();
  const { effective, pendingAction, applyAction, clearAction } =
    useProfileOptimistic();
  const loading = useLoading();
  const web3Loaded = useWeb3Loaded();
  const chainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const [isLoading, loadingMessage] = loading.use();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRelayModalOpen, setIsRelayModalOpen] = useState(false);
  const [isLastTransferModalOpen, setIsLastTransferModalOpen] = useState(false);
  type RelayUpdateParams = {
    sideChainId: SupportedChainId;
    receivingChainId: SupportedChainId;
    publicClientSide: ReturnType<typeof createPublicClient>;
    encodedData: `0x${string}`;
  };
  const [pendingRelayUpdate, setPendingRelayUpdate] = useState(
    {} as RelayUpdateParams,
  );
  const effectiveWinningStatus = effective.winningStatus;
  const isReconciling = pendingAction !== null;
  const showCrossChainBanner =
    pendingAction === "transfer" || effective.pendingUpdate;

  const [prepareTransfer, , transferStatus] = useCCPoHWrite(
    "transferHumanity",
    useMemo(
      () => ({
        onLoading() {
          loading.start();
        },
        onReady(fire) {
          fire();
        },
        onSuccess() {
          applyAction("transfer", buildTransferSuccessPatch());
          toast.success("Transfer initiated!");
          loading.stop();
          setIsTransferModalOpen(false);
        },
      }),
      [applyAction, loading],
    ),
  );
  
  const [prepareUpdate, , updateStatus] = useCCPoHWrite(
    "updateHumanity",
    useMemo(
      () => ({
        onLoading() {
          loading.start("Transaction pending...");
        },
        onReady(fire) {
          fire();
        },
        onSuccess() {
          applyAction("update", buildUpdateSuccessPatch());
          toast.success("Update transaction sent!");
          loading.stop();
          setIsUpdateModalOpen(false);
        },
        onError() {
          toast.error("Transaction failed");
          loading.stop();
        },
        onFail() {
          toast.error("Simulation failed");
          loading.stop();
        },
      }),
      [applyAction, loading],
    ),
  );

  const [prepareRelayWrite, , relayStatus] = useRelayWrite(
    "executeSignatures",
    useMemo(
      () => ({
        onLoading() {
          loading.start("Relaying update...");
        },
        onReady(fire) {
          fire();
        },
        onSuccess() {
          applyAction("update", buildUpdateSuccessPatch());
          toast.success("Relay transaction sent!");
          loading.stop();
          setIsRelayModalOpen(false);
          setIsLastTransferModalOpen(false);
        },
        onError() {
          toast.error("Transaction failed");
          loading.stop();
        },
        onFail() {
          toast.error("Confirmation takes around 10 minutes. Come back later");
          loading.stop();
        },
      }),
      [applyAction, loading],
    ),
  );

  const hasTransferInFlight =
    transferStatus.write === "pending" ||
    (transferStatus.write === "success" && transferStatus.transaction === "pending");
  const hasUpdateInFlight =
    updateStatus.write === "pending" ||
    (updateStatus.write === "success" && updateStatus.transaction === "pending");
  const hasRelayInFlight =
    relayStatus.write === "pending" ||
    (relayStatus.write === "success" && relayStatus.transaction === "pending");

  const closeTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
    if (!hasTransferInFlight) {
      loading.stop();
    }
  }, [hasTransferInFlight, loading]);

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    if (!hasUpdateInFlight) {
      loading.stop();
    }
  }, [hasUpdateInFlight, loading]);

  const closeRelayModal = useCallback(() => {
    setIsRelayModalOpen(false);
    if (!hasRelayInFlight) {
      loading.stop();
    }
  }, [hasRelayInFlight, loading]);

  const closeLastTransferModal = useCallback(() => {
    setIsLastTransferModalOpen(false);
    if (!hasRelayInFlight) {
      loading.stop();
    }
  }, [hasRelayInFlight, loading]);

  const publicClient =
    lastTransferChain &&
    createPublicClient({
      chain: supportedChains[lastTransferChain.id],
      transport: http(getChainRpc(lastTransferChain.id)),
    });

  const checkPendingUpdate = useCallback(async () => {
    if (
      !web3Loaded
    ) {
      setPendingRelayUpdate({} as RelayUpdateParams);
      return;
    }

    try {
      const sendingChainId = homeChain.id as SupportedChainId;
      const receivingChainId = getForeignChain(homeChain.id) as SupportedChainId;
      
      const [sendingUpdates, receivingUpdates] = await Promise.all([
        sdk[sendingChainId].CrossChainUpdates({ humanityId: pohId }),
        sdk[receivingChainId].CrossChainUpdates({ humanityId: pohId }),
      ]);

      const latestOutUpdate = sendingUpdates?.outUpdates?.[0];
      const latestInUpdate = receivingUpdates?.inUpdates?.[0];

      if (!latestOutUpdate) {
        setPendingRelayUpdate({} as RelayUpdateParams);
        return;
      }

      const publicClientSending = createPublicClient({
        chain: supportedChains[sendingChainId],
        transport: http(getChainRpc(sendingChainId)),
      });

      const txSending = await publicClientSending.getTransactionReceipt({
        hash: latestOutUpdate.txHash as Hash,
      });

      const expirationTime = getUpdateExpiration(txSending, sendingChainId);
      const expired = expirationTime ? Number(expirationTime) < Date.now() / 1000 : true;
      
      if (expired) {
        setPendingRelayUpdate({} as RelayUpdateParams);
        return;
      }

      const ambInfo = getAMBMessageInfo(
        txSending,
        sendingChainId,
        Number(latestOutUpdate.logIndex),
      );

      if (!ambInfo || !ambInfo.encodedData || !ambInfo.messageId) {
        setPendingRelayUpdate({} as RelayUpdateParams);
        return;
      }

      const { messageId: messageIdSending, encodedData } = ambInfo;

      let messageIdReceiving;
      if (latestInUpdate) {
        const publicClientReceiving = createPublicClient({
          chain: supportedChains[receivingChainId],
          transport: http(getChainRpc(receivingChainId)),
        });

        const txReceiving = await publicClientReceiving.getTransactionReceipt({
          hash: latestInUpdate.txHash as Hash,
        });

        messageIdReceiving = getRelayedMessageId(
          txReceiving,
          receivingChainId,
          Number(latestInUpdate.logIndex),
        );
      }

      if (!latestInUpdate || messageIdSending !== messageIdReceiving) {
        setPendingRelayUpdate({
          sideChainId: sendingChainId,
          receivingChainId: receivingChainId,
          publicClientSide: publicClientSending,
          encodedData: encodedData,
        });
        return;
      }

      setPendingRelayUpdate({} as RelayUpdateParams);
      if (effective.pendingUpdate) {
        clearAction();
      }
    } catch (error) {
      if (isReceiptPendingError(error)) {
        setPendingRelayUpdate({} as RelayUpdateParams);
        return;
      }

      console.error("Failed to check pending cross-chain update", error);
    }
  }, [clearAction, effective.pendingUpdate, homeChain, pohId, web3Loaded]);

  const handleExecuteRelay = async () => {
    loading.start("Fetching signatures...");
    try {
      const signatures = await pendingRelayUpdate.publicClientSide.readContract({
        address: getContractInfo("GnosisAMBHelper", pendingRelayUpdate.sideChainId).address as `0x${string}`,
        abi: getContractInfo("GnosisAMBHelper", pendingRelayUpdate.sideChainId).abi,
        functionName: "getSignatures",
        args: [pendingRelayUpdate.encodedData],
      }) as `0x${string}`;
      
      prepareRelayWrite({
        args: [pendingRelayUpdate.encodedData, signatures],
      });
    } catch (e: any) {
      toast.info("⏳ Confirmation takes around 10 minutes. Come back later");
      loading.stop();
    }
  };

  const handleRelayTransfer = async () => {
    loading.start("Fetching signatures...");
    const address = getContractInfo("CrossChainProofOfHumanity", lastTransferChain!.id).address as Address;
    
    const allTxs = await publicClient!.getContractEvents({
      address: address,
      abi: getContractInfo("CrossChainProofOfHumanity", lastTransferChain!.id).abi,
      eventName: "TransferInitiated",
      fromBlock: CreationBlockNumber.CrossChainProofOfHumanity[lastTransferChain!.id] as bigint,
      strict: true,
      args: { humanityId: pohId },
    });
    
    const matchingEvent = allTxs.find(
      (tx: any) => tx.args.transferHash === lastTransfer?.transferHash,
    );

    if (!matchingEvent) {
      loading.stop();
      return;
    }

    const tx = await publicClient!.getTransactionReceipt({
      hash: matchingEvent.transactionHash,
    });
    
    const data = tx.logs.at(1)?.data;
    const subEnd = lastTransferChain!.id === gnosisChiado.id ? 754 : 748;
    const encodedData = `0x${data?.substring(130, subEnd)}` as `0x${string}`;

    try {
      const signatures = await publicClient!.readContract({
        address: getContractInfo("GnosisAMBHelper", lastTransferChain!.id).address as `0x${string}`,
        abi: getContractInfo("GnosisAMBHelper", lastTransferChain!.id).abi,
        functionName: "getSignatures",
        args: [encodedData],
      }) as `0x${string}`;
      
      prepareRelayWrite({
        args: [encodedData, signatures],
      });
    } catch (e) {
      toast.info("Confirmation takes around 10 minutes. Come back later");
      loading.stop();
    }
  };

  const handleUpdateStateForChain = async (targetChain: SupportedChain) => {
    loading.start("Preparing update...");

    const gatewayForChain = contractData[homeChain.id].gateways[contractData[homeChain.id].gateways.length - 1];

    if (!gatewayForChain) {
      loading.stop();
      return;
    }

    prepareUpdate({
      args: [gatewayForChain.id, pohId],
    });
  };

  const showPendingUpdate = () => {
    const sendingChainName = idToChain(pendingRelayUpdate.sideChainId)?.name;
    const receivingChainName = idToChain(pendingRelayUpdate.receivingChainId)?.name;
    const isOnCorrectChain = chainId === pendingRelayUpdate.receivingChainId;
    
    return (
      <>
        <button 
          className="m-4 border-2 border-blue-500 p-2 font-bold text-blue-500"
          onClick={() => setIsRelayModalOpen(true)}
        >
          ⏳ Pending relay
        </button>
        <Modal
          open={isRelayModalOpen}
          onClose={closeRelayModal}
          canClose={!hasRelayInFlight}
          header="Pending state update"
        >
          <div className="paper flex flex-col p-4">
          <span className="txt text-primaryText m-2 font-semibold">
            {sendingChainName} ▶ {receivingChainName}
          </span>
          <span className="txt text-secondaryText m-2">
            There is a pending state update that needs to be relayed on{" "}
            {receivingChainName}.
          </span>
          
          {!isOnCorrectChain ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="paper border-orange p-3">
                <span className="txt text-orange">
                  ⚠️ Please switch to <strong>{receivingChainName}</strong> to execute the relay
                </span>
              </div>
              <button
                className="btn-main"
                onClick={() => switchChain({chainId: pendingRelayUpdate.receivingChainId})}
              >
                Switch to {receivingChainName}
              </button>
            </div>
          ) : (
            <>
              {pendingRelayUpdate.sideChainId === 100 ||
              pendingRelayUpdate.sideChainId === 10200 ? (
                <button
                  className="btn-main mt-4"
                  disabled={isLoading}
                  onClick={handleExecuteRelay}
                >
                  {isLoading ? "Processing..." : "Execute relay"}
                </button>
              ) : (
                <div className="paper mt-4 p-4">
                  <span className="txt text-secondaryText">
                    Relaying a state update from this chain can take around 30 minutes.
                    The relay will be processed automatically by the bridge oracles.
                  </span>
                </div>
              )}
            </>
          )}
          </div>
        </Modal>
      </>
    );
  };

  useEffect(() => {
    // Only check for pending updates if profile is not in transfer state
    if (effectiveWinningStatus !== "transferring" && effectiveWinningStatus !== "transferred") {
      checkPendingUpdate();
    }
  }, [checkPendingUpdate, effectiveWinningStatus]);

  useEffect(() => {
    if (effectiveWinningStatus === "transferring" || effectiveWinningStatus === "transferred") {
      closeTransferModal();
    }
    if (effective.pendingUpdate || effectiveWinningStatus === "transferred") {
      closeUpdateModal();
      closeRelayModal();
    }
  }, [
    closeRelayModal,
    closeTransferModal,
    closeUpdateModal,
    effective.pendingUpdate,
    effectiveWinningStatus,
  ]);

  return (
    <div className="flex w-full flex-col items-center border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-secondaryText">Home chain</span>
        <span className="flex items-center font-semibold">
          <ChainLogo
            chainId={homeChain.id}
            className="fill-primaryText mr-2 h-4 w-4"
          />
          {homeChain.name}
        </span>
        {showCrossChainBanner && (
          <span className="text-secondaryText mt-2 text-center sm:text-left">
            {pendingAction === "transfer"
              ? "Waiting for indexed cross-chain state."
              : "Cross-chain state update pending."}
          </span>
        )}
      </div>

      {web3Loaded &&
        address?.toLowerCase() === claimer &&
        homeChain.id === chainId &&
        effectiveWinningStatus !== "transferring" &&
        effectiveWinningStatus !== "transferred" &&
        (
          <>
            <div className="group relative">
              <button 
                className="text-sky-500" 
                disabled={isReconciling}
                onClick={() => setIsTransferModalOpen(true)}
              >
                Transfer
              </button>
              {isReconciling && (
                <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white transition-opacity pointer-events-none">
                  Syncing
                  <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-neutral-700" />
                </span>
              )}
            </div>
            <Modal
              formal
              open={isTransferModalOpen}
              onClose={closeTransferModal}
              canClose={!hasTransferInFlight}
              header="Transfer"
            >
              <div className="p-4">
              <span className="txt text-primaryText m-2">
                Transfer your humanity to another chain. If you use a contract
                wallet make sure it has the same address on both chains.
              </span>
              <button
                className="btn-main mt-4"
                onClick={() =>
                  prepareTransfer({
                    args: [contractData[homeChain.id].gateways[contractData[homeChain.id].gateways.length - 1].id],
                  })
                }
              >
                Transfer
              </button>
              </div>
            </Modal>
          </>
        )}

      {web3Loaded &&
        homeChain.id === chainId &&
        effectiveWinningStatus !== "transferring" &&
        effectiveWinningStatus !== "transferred" &&
        !effective.pendingUpdate &&
        (!pendingRelayUpdate || !pendingRelayUpdate.encodedData) && (
          <>
            <div className="group relative">
              <button 
                className="text-sky-500"
                disabled={isReconciling}
                onClick={() => setIsUpdateModalOpen(true)}
              >
                Update state
              </button>
              {isReconciling && (
                <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white transition-opacity pointer-events-none">
                  Syncing
                  <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-neutral-700" />
                </span>
              )}
            </div>
            <Modal
              formal
              open={isUpdateModalOpen}
              onClose={closeUpdateModal}
              canClose={!hasUpdateInFlight}
              header="Update"
            >
              <div className="p-4"> 
              <span className="txt text-primaryText m-2">
                Update humanity state on another chain. If you use wallet
                contract make sure it has same address on both chains.
              </span>

              <div>
                {supportedChains.map((chain) => {
                  const crossChainReg = humanity[chain.id].crossChainRegistration;
                  const isExpired = crossChainReg 
                    ? Number(crossChainReg.expirationTime) < Date.now() / 1000
                    : true;
                  const isValid = chain.id === homeChain.id || (crossChainReg && !isExpired);
                  
                  return (
                    <div
                      key={chain.id}
                      className="text-primaryText m-2 flex items-center justify-between border p-2"
                    >
                      <div className="flex items-center">
                        <ChainLogo
                          chainId={chain.id}
                          className="fill-primaryText mr-1 h-4 w-4"
                        />
                        {chain.name}{" "}
                        {isValid ? "✔" : "❌"}
                      </div>

                      {chain.id === homeChain.id ? (
                        <div>Home chain</div>
                      ) : (
                        <>
                          {crossChainReg && (
                            <div className={isExpired ? "text-orange-500" : ""}>
                              {isExpired ? "Expired " : "Expires "}
                              {timeAgo(crossChainReg.expirationTime)}
                            </div>
                          )}
                          <button
                            className="text-blue-500 underline underline-offset-2 disabled:no-underline disabled:cursor-not-allowed disabled:text-secondaryText"
                            disabled={isLoading}
                            onClick={() => handleUpdateStateForChain(chain)}
                          >
                            {isLoading ? "Processing..." : "Relay State Update"}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
            </Modal>
          </>
        )}
      {web3Loaded &&
        //address?.toLowerCase() === claimer &&
        //homeChain?.id === chainId &&
        homeChain &&
        effectiveWinningStatus === "transferred" &&
        publicClient && (
          <>
            <button 
              className="m-4 border-2 border-blue-500 p-2 font-bold text-blue-500"
              onClick={() => setIsLastTransferModalOpen(true)}
            >
              ⏳ Pending relay
            </button>
            <Modal
              open={isLastTransferModalOpen}
              onClose={closeLastTransferModal}
              canClose={!hasRelayInFlight}
              header="Last transfer"
            >
              <div className="paper flex flex-col p-4">
              <span className="text-primaryText">
                {lastTransferChain?.name} ▶ {homeChain?.name}
              </span>
              <TimeAgo time={parseInt(lastTransfer?.transferTimestamp)} />
              {homeChain?.id === chainId &&
              (chainId === mainnet.id || chainId === sepolia.id) ? (
                <button
                  className="text-blue-500 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-secondaryText"
                  disabled={isLoading}
                  onClick={handleRelayTransfer}
                >
                  {isLoading ? "Processing..." : "Relay Transferring Profile"}
                </button>
              ) : homeChain.id === mainnet.id || homeChain.id === sepolia.id ? (
                <div className="p-4">
                  <span className="txt text-secondaryText m-2">
                    Connect to home chain for relaying the transferring profile
                  </span>
                </div>
              ) : (
                <div className="p-4">
                  <span className="txt text-secondaryText m-2">
                    Relaying the transferring profile in this chain can take
                    around 30 minutes
                  </span>
                </div>
              )}
              </div>
            </Modal>
          </>
        )}
      {!!pendingRelayUpdate && pendingRelayUpdate.encodedData
        ? showPendingUpdate()
        : null}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <LoadingSpinner message={loadingMessage} color="white" />
        </div>
      )}
    </div>
  );
}
