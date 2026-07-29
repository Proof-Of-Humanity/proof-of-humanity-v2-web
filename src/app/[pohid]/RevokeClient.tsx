"use client";

import { useCallback, useState } from "react";
import type { Hash } from "viem";

import ActionButton from "components/ActionButton";
import type { SupportedChain } from "config/chains";
import type { ContractData } from "data/contract";
import { WAITING_FOR_INDEXER_TOOLTIP } from "hooks/useActionFeedback";
import { useProfileOptimistic } from "optimistic/profile";

import RevokeModal from "./RevokeModal";

export { buildRevokeSuccessPatch } from "./RevokeModal";

interface RevokeProps {
  cost: bigint;
  pohId: Hash;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
}

function PendingRevocationNotice() {
  const { pendingAction } = useProfileOptimistic();

  return (
    <span className="text-secondaryText mb-2 text-center">
      {pendingAction === "revoke"
        ? "Removal proposed. Waiting for indexed state."
        : "Removal proposed."}
    </span>
  );
}

/** Rendered instead of `RevokeClient` when the revocation cost can't be loaded. */
export function RevokeUnavailable({ reason }: { reason: string }) {
  const { effective } = useProfileOptimistic();

  return effective.pendingRevocation ? (
    <PendingRevocationNotice />
  ) : (
    <ActionButton
      onClick={() => undefined}
      label="Revoke"
      disabled
      tooltip={reason}
    />
  );
}

export default function RevokeClient({
  pohId,
  cost,
  homeChain,
  arbitrationInfo,
}: RevokeProps) {
  const { effective, pendingAction } = useProfileOptimistic();
  const isReconciling = pendingAction !== null;
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  if (effective.pendingRevocation) return <PendingRevocationNotice />;

  return (
    <>
      <ActionButton
        className="w-fit min-w-[170px]"
        onClick={() => setModalOpen(true)}
        label="Revoke"
        disabled={isReconciling}
        tooltip={isReconciling ? WAITING_FOR_INDEXER_TOOLTIP : undefined}
      />
      <RevokeModal
        open={modalOpen}
        onClose={closeModal}
        pohId={pohId}
        cost={cost}
        homeChain={homeChain}
        arbitrationInfo={arbitrationInfo}
      />
    </>
  );
}
