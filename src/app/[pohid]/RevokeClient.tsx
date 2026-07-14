"use client";

import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useCallback, useEffect, useState } from "react";
import type { Hash } from "viem";

import ActionButton from "components/ActionButton";
import type { SupportedChain } from "config/chains";
import type { ContractData } from "data/contract";
import { WAITING_FOR_INDEXER_TOOLTIP } from "hooks/useActionFeedback";
import { useProfileOptimistic } from "optimistic/profile";

import RevokeModal from "./RevokeModal";

enableReactUse();

export { buildRevokeSuccessPatch } from "./RevokeModal";

interface RevokeProps {
  cost?: bigint;
  pohId: Hash;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
  unavailableReason?: string;
}

export default function RevokeClient({
  pohId,
  cost,
  homeChain,
  arbitrationInfo,
  unavailableReason,
}: RevokeProps) {
  const { effective, pendingAction } = useProfileOptimistic();
  const isReconciling = pendingAction !== null;
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (effective.pendingRevocation) closeModal();
  }, [closeModal, effective.pendingRevocation]);

  const pendingNotice = (
    <span className="text-secondaryText mb-2 text-center">
      {pendingAction === "revoke"
        ? "Removal proposed. Waiting for indexed state."
        : "Removal proposed."}
    </span>
  );

  if (unavailableReason)
    return effective.pendingRevocation ? (
      pendingNotice
    ) : (
      <ActionButton
        onClick={() => undefined}
        label="Revoke"
        disabled
        tooltip={unavailableReason}
      />
    );

  if (effective.pendingRevocation) return pendingNotice;

  return (
    <>
      <ActionButton
        className="w-[170px]"
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
