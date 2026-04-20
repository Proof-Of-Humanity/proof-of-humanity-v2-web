import type { ProfilePageState } from "../profileState";

export type CrossChainState = {
  canShowCrossChain: boolean;
  canTransfer: boolean;
  canUpdate: boolean;
};

export const deriveCrossChainState = ({
  pageState,
  pendingRevocation,
  hasHomeChain,
}: {
  pageState: ProfilePageState;
  pendingRevocation: boolean;
  hasHomeChain: boolean;
}): CrossChainState => {
  const canTransfer =
    hasHomeChain && pageState === "CLAIMED" && !pendingRevocation;
  const canUpdate =
    hasHomeChain && (pageState === "CLAIMED" || pageState === "REMOVED");

  return {
    canShowCrossChain:
      hasHomeChain &&
      (pageState === "TRANSFER_PENDING" || canTransfer || canUpdate),
    canTransfer,
    canUpdate,
  };
};
