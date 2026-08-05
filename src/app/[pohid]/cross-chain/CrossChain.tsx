import {
  type SupportedChain,
  type SupportedChainId,
  getForeignChain,
} from "config/chains";
import ChainLogo from "components/ChainLogo";
import type { ContractData } from "data/contract";
import { sdk } from "config/subgraph";
import type { ProfileHumanityQuery } from "generated/graphql";
import { type Hash, TransactionReceiptNotFoundError } from "viem";
import { ProfileOptimisticProvider } from "optimistic/profile";

import type { ProfilePageState } from "../profileState";
import {
  CrossChainStatusUnavailableError,
  RelayDataUnavailableError,
} from "../errors";
import { getBridgeStrategy } from "./bridgeStrategies";
import { deriveCrossChainState, type CrossChainState } from "./crossChainState";
import CrossChainStatusStrip from "./CrossChainStatusStrip";
import PendingRelaySection, {
  type PendingRelayDescriptor,
  TRANSFER_RELAY_KIND,
  UPDATE_RELAY_KIND,
} from "./PendingRelaySection";
import { getChainPublicClient } from "./publicClient";
import { getAMBMessageInfo, hasRelayedMessage } from "./relayHelpers";
import TransferSection from "./TransferSection";
import { RELAY_MODE_WAIT_ONLY } from "./types";
import UpdateStateSection from "./UpdateStateSection";

type PendingUpdateRelayError =
  | RelayDataUnavailableError
  | CrossChainStatusUnavailableError;

interface CrossChainProps {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  homeChain: SupportedChain;
  homeChainContractData: ContractData;
  pendingRevocation: boolean;
  pohId: Hash;
  winningRequestChainId?: SupportedChainId;
  latestWinningRequestTimestamp?: number;
  lastTransferTimestamp?: number;
  pageState: ProfilePageState;
}

const getPendingUpdateStatusMessage = (
  error?: RelayDataUnavailableError | CrossChainStatusUnavailableError,
) => {
  if (error instanceof RelayDataUnavailableError) {
    return {
      title: "Relay details unavailable",
      description: error.message,
      nextStep: "Refresh the page or try again in a moment.",
    };
  }

  if (error instanceof CrossChainStatusUnavailableError) {
    return {
      title: "Update unavailable",
      description: error.message,
      nextStep: "Refresh the page or try again in a moment.",
    };
  }

  return null;
};

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
    throw new RelayDataUnavailableError(
      "Pending transfer relay details could not be loaded.",
    );
  }

  return outboundBridgeMessage.encodedData;
}

async function resolvePendingTransferRelay({
  humanity,
  homeChain,
  pohId,
  winningRequestChainId,
}: {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  homeChain: SupportedChain;
  pohId: Hash;
  winningRequestChainId?: SupportedChainId;
}): Promise<PendingRelayDescriptor> {
  if (!winningRequestChainId) {
    throw new RelayDataUnavailableError(
      "Pending transfer source chain could not be loaded.",
    );
  }

  const sourceChainId = winningRequestChainId;
  const lastTransfer = humanity[sourceChainId]?.outTransfer;

  if (!lastTransfer) {
    throw new RelayDataUnavailableError(
      "Pending transfer details could not be loaded.",
    );
  }

  const destinationChainId = homeChain.id as SupportedChainId;
  const relayMode = getBridgeStrategy(
    sourceChainId,
    destinationChainId,
  ).relayMode;
  const pendingTransferRelay: PendingRelayDescriptor = {
    ...TRANSFER_RELAY_KIND,
    relayMode,
    sourceChainId,
    destinationChainId,
    startedAt: Number(lastTransfer.transferTimestamp),
  };

  if (relayMode !== RELAY_MODE_WAIT_ONLY) {
    pendingTransferRelay.encodedData = await decodeTransferRelayPayload({
      lastTransfer,
      sourceChainId,
      humanityId: pohId,
    });
  }

  return pendingTransferRelay;
}

async function resolvePendingUpdateRelay({
  homeChain,
  pohId,
  latestWinningRequestTimestamp,
}: {
  homeChain: SupportedChain;
  pohId: Hash;
  latestWinningRequestTimestamp?: number;
}): Promise<PendingRelayDescriptor | null> {
  const sourceChainId = homeChain.id as SupportedChainId;
  const destinationChainId = getForeignChain(sourceChainId) as SupportedChainId;
  const sourceUpdates = await sdk[sourceChainId].CrossChainUpdates({
    humanityId: pohId,
  });

  const latestOutUpdate = sourceUpdates.outUpdates[0];

  if (!latestOutUpdate) {
    return null;
  }

  const outboundUpdateTimestamp = Number(latestOutUpdate.timestamp || 0);

  if (
    latestWinningRequestTimestamp &&
    outboundUpdateTimestamp < latestWinningRequestTimestamp
  ) {
    return null;
  }

  const pendingUpdateRelay: PendingRelayDescriptor = {
    ...UPDATE_RELAY_KIND,
    relayMode: getBridgeStrategy(sourceChainId, destinationChainId).relayMode,
    sourceChainId,
    destinationChainId,
  };

  const sourceReceipt = await getTransactionReceiptIfIndexed({
    chainId: sourceChainId,
    txHash: latestOutUpdate.txHash as Hash,
  });

  if (!sourceReceipt) {
    return pendingUpdateRelay;
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
    throw new RelayDataUnavailableError(
      "Pending update relay details could not be loaded.",
    );
  }

  pendingUpdateRelay.encodedData = sourceMessageInfo.encodedData;

  if (!latestInUpdate) {
    return pendingUpdateRelay;
  }

  const destinationReceipt = await getTransactionReceiptIfIndexed({
    chainId: destinationChainId,
    txHash: latestInUpdate.txHash as Hash,
  });

  if (!destinationReceipt) {
    return pendingUpdateRelay;
  }

  const updateAlreadyRelayed = hasRelayedMessage({
    txReceipt: destinationReceipt,
    messageId: sourceMessageInfo.messageId,
    destinationChainId,
  });

  if (updateAlreadyRelayed) {
    return null;
  }

  return pendingUpdateRelay;
}

async function resolvePendingUpdateRelayState({
  canUpdate,
  homeChain,
  pohId,
  latestWinningRequestTimestamp,
}: {
  canUpdate: boolean;
  homeChain: SupportedChain;
  pohId: Hash;
  latestWinningRequestTimestamp?: number;
}): Promise<{
  error?: PendingUpdateRelayError;
  pendingUpdateRelay: PendingRelayDescriptor | null;
}> {
  if (!canUpdate) {
    return {
      pendingUpdateRelay: null,
    };
  }

  try {
    return {
      pendingUpdateRelay: await resolvePendingUpdateRelay({
        homeChain,
        pohId,
        latestWinningRequestTimestamp,
      }),
    };
  } catch (error) {
    return {
      error:
        error instanceof RelayDataUnavailableError
          ? error
          : new CrossChainStatusUnavailableError(
              "Pending relay status could not be loaded.",
            ),
      pendingUpdateRelay: null,
    };
  }
}

function CrossChainActions({
  crossChainState,
  gatewayId,
  homeChain,
  humanity,
  pendingTransferRelay,
  pendingUpdateError,
  pendingUpdateRelay,
  pohId,
  transferClaimer,
  transferCooldownEndsAt,
}: {
  crossChainState: CrossChainState;
  gatewayId?: `0x${string}`;
  homeChain: SupportedChain;
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  pendingTransferRelay: PendingRelayDescriptor | null;
  pendingUpdateError?: PendingUpdateRelayError;
  pendingUpdateRelay: PendingRelayDescriptor | null;
  pohId: Hash;
  transferClaimer?: string;
  transferCooldownEndsAt?: number;
}) {
  if (pendingTransferRelay) {
    return <PendingRelaySection {...pendingTransferRelay} />;
  }

  if (pendingUpdateRelay) {
    return <PendingRelaySection {...pendingUpdateRelay} />;
  }

  const pendingUpdateStatusMessage =
    getPendingUpdateStatusMessage(pendingUpdateError);

  return (
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
      {pendingUpdateStatusMessage ? (
        <div className="mt-4 w-full min-w-0 sm:ml-4 sm:mt-0 sm:flex-1">
          <CrossChainStatusStrip title={pendingUpdateStatusMessage.title}>
            <p>{pendingUpdateStatusMessage.description}</p>
            <p>{pendingUpdateStatusMessage.nextStep}</p>
          </CrossChainStatusStrip>
        </div>
      ) : null}
    </>
  );
}

export default async function CrossChain({
  humanity,
  homeChain,
  homeChainContractData,
  pendingRevocation,
  pohId,
  winningRequestChainId,
  latestWinningRequestTimestamp,
  lastTransferTimestamp,
  pageState,
}: CrossChainProps) {
  try {
    const crossChainState = deriveCrossChainState({
      pageState,
      pendingRevocation,
      hasHomeChain: true,
    });

    if (!crossChainState.canShowCrossChain) {
      return null;
    }

    const gatewayId =
      homeChainContractData.gateways[homeChainContractData.gateways.length - 1]
        ?.id;
    const transferCooldownEndsAt = lastTransferTimestamp
      ? lastTransferTimestamp + homeChainContractData.transferCooldown
      : undefined;
    let pendingTransferRelay: PendingRelayDescriptor | null = null;
    const transferClaimer =
      humanity[homeChain.id]?.humanity?.registration?.claimer.id;

    if (pageState === "TRANSFER_PENDING") {
      pendingTransferRelay = await resolvePendingTransferRelay({
        humanity,
        homeChain,
        pohId,
        winningRequestChainId,
      });
    }

    const pendingUpdateRelay = await resolvePendingUpdateRelayState({
      canUpdate: crossChainState.canUpdate,
      homeChain,
      pohId,
      latestWinningRequestTimestamp,
    });

    return (
      <ProfileOptimisticProvider
        base={{
          hasPendingUpdateRelay: !!pendingUpdateRelay.pendingUpdateRelay,
        }}
      >
        <div className="border-stroke flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-4 border-t px-4 py-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-secondaryText">Home chain:</span>
            <span className="text-primaryText flex items-center gap-2">
              <ChainLogo
                chainId={homeChain.id}
                className="h-6 w-6 fill-current"
              />
              {homeChain.name}
            </span>
          </div>

          <CrossChainActions
            crossChainState={crossChainState}
            gatewayId={gatewayId}
            homeChain={homeChain}
            humanity={humanity}
            pendingTransferRelay={pendingTransferRelay}
            pendingUpdateError={pendingUpdateRelay.error}
            pendingUpdateRelay={pendingUpdateRelay.pendingUpdateRelay}
            pohId={pohId}
            transferClaimer={transferClaimer}
            transferCooldownEndsAt={transferCooldownEndsAt}
          />
        </div>
      </ProfileOptimisticProvider>
    );
  } catch (error) {
    return (
      <div
        className="w-full px-4 py-3"
        title={
          error instanceof Error
            ? error.message
            : "Unknown cross-chain failure."
        }
      >
        <CrossChainStatusStrip title="Cross-chain unavailable">
          Bridge status could not be loaded. Refresh the page or try again in a
          moment.
        </CrossChainStatusStrip>
      </div>
    );
  }
}
