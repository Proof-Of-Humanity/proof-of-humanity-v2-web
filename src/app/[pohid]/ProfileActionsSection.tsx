import { Suspense } from "react";
import { ProfileOptimisticProvider } from "optimistic/profile";
import { type Hash } from "viem";

import ActionWalletGate from "./ActionWalletGate";
import CrossChain from "./cross-chain/CrossChain";
import CrossChainLoading from "./cross-chain/CrossChainLoading";
import { getProfileBaseData } from "./profilePageData";
import Renew from "./Renew";
import Revoke from "./Revoke";
import StatusCard, { StatusBadge } from "./StatusCard";

interface ProfileActionsSectionProps {
  pohId: Hash;
}

export default async function ProfileActionsSection({
  pohId,
}: ProfileActionsSectionProps) {
  try {
    const {
      contractData,
      latestWinningRequest,
      pageState,
      humanity,
      claimedRegistration,
      homeChain,
      lastTransferTimestamp,
      pendingRevocation,
      canRenew,
    } = await getProfileBaseData(pohId);

    const homeChainContractData = homeChain ? contractData[homeChain.id] : null;
    const canHaveCrossChainActions =
      !!homeChainContractData &&
      ["CLAIMED", "TRANSFER_PENDING", "REMOVED"].includes(pageState);
    const latestWinningRequestTimestamp = latestWinningRequest
      ? Number(
          latestWinningRequest.lastStatusChange ||
            latestWinningRequest.creationTime ||
            0,
        ) || undefined
      : undefined;

    const baseSnapshot = {
      winningStatus: latestWinningRequest?.status.id,
      lastTransferTimestamp,
      pendingRevocation,
      hasPendingTransferRelay: pageState === "TRANSFER_PENDING",
    };

    if (!claimedRegistration && !canHaveCrossChainActions) {
      return null;
    }

    return (
      <div className="mt-4 w-full self-stretch">
        <ProfileOptimisticProvider
          base={baseSnapshot}
          storageKey={`profile:${pohId}`}
        >
          <div className="flex w-full flex-col items-center gap-4">
            {claimedRegistration && homeChain && homeChainContractData ? (
              <ActionWalletGate homeChainId={homeChain.id}>
                {canRenew ? (
                  <Renew
                    claimer={claimedRegistration.claimer.id}
                    pohId={pohId}
                  />
                ) : null}
                <Suspense fallback={null}>
                  <Revoke
                    pohId={pohId}
                    arbitrationInfo={homeChainContractData.arbitrationInfo}
                    baseDeposit={homeChainContractData.baseDeposit}
                    homeChain={homeChain}
                  />
                </Suspense>
              </ActionWalletGate>
            ) : null}

            {canHaveCrossChainActions && homeChain && homeChainContractData ? (
              <Suspense fallback={<CrossChainLoading />}>
                <CrossChain
                  homeChain={homeChain}
                  homeChainContractData={homeChainContractData}
                  pageState={pageState}
                  pendingRevocation={pendingRevocation}
                  pohId={pohId}
                  humanity={humanity}
                  winningRequestChainId={latestWinningRequest?.chainId}
                  latestWinningRequestTimestamp={latestWinningRequestTimestamp}
                  lastTransferTimestamp={lastTransferTimestamp}
                />
              </Suspense>
            ) : null}
          </div>
        </ProfileOptimisticProvider>
      </div>
    );
  } catch {
    return (
      <div className="border-stroke mt-8 w-full self-stretch border-t px-4 py-4">
        <StatusCard
          section="Actions"
          className="mt-3 flex items-center justify-between gap-3 border-dashed px-4 py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <StatusBadge className="h-6 w-6 text-xs" />
            <div className="text-primaryText text-sm font-semibold">
              Actions unavailable
            </div>
          </div>
          <div className="text-secondaryText shrink-0 text-xs">Retry later</div>
        </StatusCard>
      </div>
    );
  }
}
