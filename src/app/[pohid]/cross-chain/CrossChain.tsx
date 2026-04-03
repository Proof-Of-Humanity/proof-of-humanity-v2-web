import {
  type SupportedChain,
  type SupportedChainId,
  getForeignChain,
} from "config/chains";
import ChainLogo from "components/ChainLogo";
import { sdk } from "config/subgraph";
import type { ProfileHumanityQuery } from "generated/graphql";
import { type Hash, TransactionReceiptNotFoundError } from "viem";

import type { ProfilePageState } from "../profileState";
import { getBridgeStrategy } from "./bridgeStrategies";
import type { CrossChainState } from "./crossChainState";
import CrossChainError from "./CrossChainError";
import PendingRelaySection from "./PendingRelaySection";
import { getChainPublicClient } from "./publicClient";
import { getAMBMessageInfo, hasRelayedMessage } from "./relayHelpers";
import TransferSection from "./TransferSection";
import { RELAY_MODE_WAIT_ONLY, type RelayMode } from "./types";
import UpdateStateSection from "./UpdateStateSection";

type PendingRelayDescriptor = {
  relayMode: RelayMode;
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  encodedData?: `0x${string}`;
  transferTimestamp?: number;
};

interface CrossChainProps {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  homeChain: SupportedChain;
  pohId: Hash;
  gatewayId?: `0x${string}`;
  winningRequestChainId?: SupportedChainId;
  pageState: ProfilePageState;
  crossChainState: CrossChainState;
  transferCooldownEndsAt?: number;
  pendingUpdateRelayStatus: {
    pendingUpdateRelay: PendingRelayDescriptor | null;
  };
  pendingUpdateError?: Error;
}

const getTransactionReceiptIfIndexed = async ({
  chainId,
  txHash,
}: {
  chainId: SupportedChainId;
  txHash: Hash;
}) => {
  try {
    return await getChainPublicClient(chainId).getTransactionReceipt({
      hash: txHash,
    });
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) {
      return null;
    }

    throw error;
  }
};

async function decodeTransferRelayPayload({
  lastTransfer,
  sourceChainId,
  humanityId,
}: {
  lastTransfer: NonNullable<ProfileHumanityQuery["outTransfer"]>;
  sourceChainId: SupportedChainId;
  humanityId: Hash;
}): Promise<`0x${string}` | undefined> {
  const receipt = await getTransactionReceiptIfIndexed({
    chainId: sourceChainId,
    txHash: lastTransfer.txHash as Hash,
  });

  if (!receipt) {
    return undefined;
  }

  const outboundBridgeMessage = getAMBMessageInfo({
    txReceipt: receipt,
    sourceChainId,
    humanityId,
  });

  if (!outboundBridgeMessage?.encodedData) {
    throw new Error("Failed to decode pending transfer relay payload.");
  }

  return outboundBridgeMessage.encodedData;
}

export async function resolvePendingUpdateRelay({
  homeChain,
  pohId,
  latestWinningRequestTimestamp,
}: {
  homeChain: SupportedChain;
  pohId: Hash;
  latestWinningRequestTimestamp?: number;
}): Promise<{
  lastOutUpdateTimestamp?: number;
  pendingUpdateRelay: PendingRelayDescriptor | null;
}> {
  const sourceChainId = homeChain.id as SupportedChainId;
  const destinationChainId = getForeignChain(sourceChainId) as SupportedChainId;
  const sourceUpdates = await sdk[sourceChainId].CrossChainUpdates({
    humanityId: pohId,
  });

  const latestOutUpdate = sourceUpdates.outUpdates[0];

  if (!latestOutUpdate) {
    return {
      lastOutUpdateTimestamp: undefined,
      pendingUpdateRelay: null,
    };
  }

  const outboundUpdateTimestamp = Number(latestOutUpdate.timestamp || 0);

  if (
    latestWinningRequestTimestamp &&
    outboundUpdateTimestamp < latestWinningRequestTimestamp
  ) {
    return {
      lastOutUpdateTimestamp: outboundUpdateTimestamp,
      pendingUpdateRelay: null,
    };
  }

  const pendingUpdateRelay: PendingRelayDescriptor = {
    relayMode: getBridgeStrategy(sourceChainId, destinationChainId).relayMode,
    sourceChainId,
    destinationChainId,
  };

  const sourceReceipt = await getTransactionReceiptIfIndexed({
    chainId: sourceChainId,
    txHash: latestOutUpdate.txHash as Hash,
  });

  if (!sourceReceipt) {
    return {
      lastOutUpdateTimestamp: outboundUpdateTimestamp,
      pendingUpdateRelay,
    };
  }

  const destinationUpdates = await sdk[destinationChainId].CrossChainUpdates({
    humanityId: pohId,
  });
  const latestInUpdate = destinationUpdates.inUpdates[0];

  const sourceMessageInfo = getAMBMessageInfo({
    txReceipt: sourceReceipt,
    sourceChainId,
    humanityId: pohId,
  });

  if (!sourceMessageInfo?.encodedData) {
    throw new Error("Failed to decode pending update relay payload.");
  }

  pendingUpdateRelay.encodedData = sourceMessageInfo.encodedData;

  if (!latestInUpdate) {
    return {
      lastOutUpdateTimestamp: outboundUpdateTimestamp,
      pendingUpdateRelay,
    };
  }

  const destinationReceipt = await getTransactionReceiptIfIndexed({
    chainId: destinationChainId,
    txHash: latestInUpdate.txHash as Hash,
  });

  if (!destinationReceipt) {
    return {
      lastOutUpdateTimestamp: outboundUpdateTimestamp,
      pendingUpdateRelay,
    };
  }

  const updateAlreadyRelayed = hasRelayedMessage({
    txReceipt: destinationReceipt,
    messageId: sourceMessageInfo.messageId,
    destinationChainId,
  });

  if (updateAlreadyRelayed) {
    return {
      lastOutUpdateTimestamp: outboundUpdateTimestamp,
      pendingUpdateRelay: null,
    };
  }

  return {
    lastOutUpdateTimestamp: outboundUpdateTimestamp,
    pendingUpdateRelay,
  };
}

export default async function CrossChain({
  humanity,
  homeChain,
  pohId,
  gatewayId,
  winningRequestChainId,
  pageState,
  crossChainState,
  transferCooldownEndsAt,
  pendingUpdateRelayStatus,
  pendingUpdateError,
}: CrossChainProps) {
  try {
    let pendingTransferRelay: PendingRelayDescriptor | null = null;
    const transferClaimer =
      humanity[homeChain.id]?.humanity?.registration?.claimer.id;

    if (pageState === "TRANSFER_PENDING") {
      const sourceChainId = winningRequestChainId!;
      const lastTransfer = humanity[sourceChainId]!.outTransfer!;
      const transferTimestamp = Number(lastTransfer.transferTimestamp);
      const destinationChainId = homeChain.id as SupportedChainId;
      const relayMode = getBridgeStrategy(
        sourceChainId,
        destinationChainId,
      ).relayMode;

      pendingTransferRelay = {
        relayMode,
        sourceChainId,
        destinationChainId,
        transferTimestamp,
      };

      if (relayMode !== RELAY_MODE_WAIT_ONLY) {
        pendingTransferRelay.encodedData = await decodeTransferRelayPayload({
          lastTransfer,
          sourceChainId,
          humanityId: pohId,
        });
      }
    }
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
        </div>

        {pendingTransferRelay ? (
          <PendingRelaySection mode="transfer" {...pendingTransferRelay} />
        ) : pendingUpdateRelayStatus.pendingUpdateRelay ? (
          <PendingRelaySection
            mode="update"
            {...pendingUpdateRelayStatus.pendingUpdateRelay}
          />
        ) : (
          <>
            {gatewayId && crossChainState.canTransfer && transferClaimer ? (
              <TransferSection
                claimer={transferClaimer as `0x${string}`}
                homeChain={homeChain}
                gatewayId={gatewayId}
                transferCooldownEndsAt={transferCooldownEndsAt}
              />
            ) : null}
            {gatewayId && crossChainState.canUpdate && !pendingUpdateError ? (
              <UpdateStateSection
                humanity={humanity}
                homeChain={homeChain}
                gatewayId={gatewayId}
                pohId={pohId}
              />
            ) : null}
            {pendingUpdateError ? (
              <div
                className="paper border-orange bg-lightOrange mt-4 max-w-[360px] px-3 py-3 sm:ml-4 sm:mt-0"
                title={pendingUpdateError.message}
              >
                <span className="text-orange block text-xs font-semibold uppercase tracking-[0.08em]">
                  Update unavailable
                </span>
                <span className="text-primaryText mt-1 block text-sm font-medium">
                  Pending relay status could not be loaded.
                </span>
                <span className="text-secondaryText mt-1 block text-sm">
                  Refresh the page or try again in a moment.
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <CrossChainError
        error={
          error instanceof Error
            ? error
            : new Error("Unknown cross-chain failure.")
        }
      />
    );
  }
}
