import { Suspense } from "react";
import { ProfileOptimisticProvider } from "optimistic/profile";
import { type Hash } from "viem";

import CrossChain from "./cross-chain/CrossChain";
import CrossChainLoading from "./cross-chain/CrossChainLoading";
import { getProfilePageData } from "./profilePageData";
import Revoke from "./Revoke";

interface ProfileActionsSectionProps {
  pohId: Hash;
}

export default async function ProfileActionsSection({
  pohId,
}: ProfileActionsSectionProps) {
  const {
    contractData,
    latestWinningRequest,
    pageState,
    humanity,
    claimedRegistration,
    claimedHomeChain,
    arbitrationCost,
    crossChainProps,
    crossChainGatewayId,
    crossChainState,
    winningRequestChainId,
    lastTransferTimestamp,
    pendingUpdateRelayStatus,
    pendingUpdateError,
    profileState,
  } = await getProfilePageData(pohId);

  if (!claimedRegistration && !crossChainProps) {
    return null;
  }

  return (
    <ProfileOptimisticProvider
      base={{
        winningStatus: latestWinningRequest?.status.id,
        lastTransferTimestamp,
        pendingRevocation: profileState.pendingRevocation,
        hasPendingUpdateRelay: !!pendingUpdateRelayStatus.pendingUpdateRelay,
        hasPendingTransferRelay: pageState === "TRANSFER_PENDING",
      }}
      storageKey={`profile:${pohId}`}
    >
      {claimedRegistration && claimedHomeChain ? (
        <Revoke
          pohId={pohId}
          arbitrationInfo={contractData[claimedHomeChain.id].arbitrationInfo!}
          homeChain={claimedHomeChain}
          cost={
            arbitrationCost +
            BigInt(contractData[claimedHomeChain.id].baseDeposit)
          }
        />
      ) : null}

      {crossChainProps ? (
        <Suspense fallback={<CrossChainLoading />}>
          <CrossChain
            homeChain={crossChainProps.homeChain}
            pageState={pageState}
            pohId={pohId}
            humanity={humanity}
            gatewayId={crossChainGatewayId}
            winningRequestChainId={winningRequestChainId}
            crossChainState={crossChainState}
            transferCooldownEndsAt={crossChainProps.transferCooldownEndsAt}
            pendingUpdateRelayStatus={pendingUpdateRelayStatus}
            pendingUpdateError={pendingUpdateError}
          />
        </Suspense>
      ) : null}
    </ProfileOptimisticProvider>
  );
}
