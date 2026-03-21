"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticBase,
  RequestOptimisticOverlay,
} from "./types";
import useOptimisticOverlay from "./useOptimisticOverlay";

const OVERLAY_TTL_MS = 2 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;

interface RequestOptimisticContextValue {
  base: RequestOptimisticBase; // the current potentially stale data from the subgraph
  effective: RequestOptimisticBase & {
    pendingChallenge?: RequestOptimisticOverlay["pendingChallenge"];
  }; // final state after merging base + overlay 
  applyPatch: (patch: RequestOptimisticOverlay) => void;
  clearOverlay: () => void;
}

const RequestOptimisticContext =
  createContext<RequestOptimisticContextValue | null>(null);

const isOverlayEmpty = (overlay: RequestOptimisticOverlay | null) =>
  !overlay ||
  (overlay.status === undefined &&
    overlay.requestStatus === undefined &&
    overlay.lastStatusChange === undefined &&
    overlay.funded === undefined &&
    overlay.validVouches === undefined &&
    overlay.onChainVouches === undefined &&
    overlay.offChainVouches === undefined &&
    overlay.appendedEvidence === undefined &&
    overlay.pendingChallenge === undefined);

const dedupeEvidence = (items: OptimisticEvidenceItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.uri)) return false;
    seen.add(item.uri);
    return true;
  });
};

const mergeEvidence = (
  base: OptimisticEvidenceItem[],
  appended?: OptimisticEvidenceItem[],
) =>
  dedupeEvidence([...(base ?? []), ...(appended ?? [])]).sort(
    (left, right) => left.creationTime - right.creationTime,
  );

const reconcileOverlay = (
  base: RequestOptimisticBase,
  overlay: RequestOptimisticOverlay | null,
) => {
  if (!overlay) return null;

  const next: RequestOptimisticOverlay = { ...overlay };
  let changed = false;

  // remove fields that are now present in the base
  if (next.status === base.status) {
    delete next.status;
    changed = true;
  }
  if (next.requestStatus === base.requestStatus) {
    delete next.requestStatus;
    changed = true;
  }
  if (
    typeof next.lastStatusChange === "number" &&
    base.lastStatusChange >= next.lastStatusChange
  ) {
    delete next.lastStatusChange;
    changed = true;
  }
  if (typeof next.funded === "bigint" && base.funded >= next.funded) {
    delete next.funded;
    changed = true;
  }
  if (typeof next.validVouches === "number" && base.validVouches === next.validVouches) {
    delete next.validVouches;
    changed = true;
  }

  if (next.onChainVouches) {
    const baseSet = new Set(base.onChainVouches.map((item) => item.toLowerCase()));
    const matches = next.onChainVouches.every((item) => baseSet.has(item.toLowerCase()));
    if (matches) {
      delete next.onChainVouches;
      changed = true;
    }
  }

  if (next.offChainVouches) {
    const baseSet = new Set(base.offChainVouches.map((item) => item.voucher.toLowerCase()));
    const matches = next.offChainVouches.every((item) =>
      baseSet.has(item.voucher.toLowerCase()),
    );
    if (matches) {
      delete next.offChainVouches;
      changed = true;
    }
  }

  if (next.appendedEvidence) {
    const baseUris = new Set(base.evidenceList.map((item) => item.uri));
    const allPresent = next.appendedEvidence.every((item) => baseUris.has(item.uri));
    if (allPresent) {
      delete next.appendedEvidence;
      changed = true;
    }
  }

  if (next.pendingChallenge && (base.status === "disputed" || base.currentChallengeDisputeId)) {
    delete next.pendingChallenge;
    changed = true;
  }

  if (isOverlayEmpty(next)) return null;

  //reconcile is only called when base changes, but still we return same overlat if nothing changes to prevent re renders
  return changed ? next : overlay;
};

const mergePatch = (
  current: RequestOptimisticOverlay | null,
  patch: RequestOptimisticOverlay,
) => {
  const next = {
    ...current,
    ...patch,
    appendedEvidence:
      patch.appendedEvidence || current?.appendedEvidence
        ? mergeEvidence(current?.appendedEvidence ?? [], patch.appendedEvidence)
        : undefined,
  };

  return isOverlayEmpty(next) ? null : next;
};

export function RequestOptimisticProvider({
  base,
  enablePolling = true,
  children,
}: {
  base: RequestOptimisticBase;
  enablePolling?: boolean;
  children: ReactNode;
}) {
  const { overlay, applyPatch, clearOverlay } = useOptimisticOverlay({
    base,
    enablePolling,
    ttlMs: OVERLAY_TTL_MS,
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    isOverlayEmpty,
    reconcileOverlay,
    mergePatch,
  });

  const effective = useMemo(
    () => ({
      ...base,
      status: overlay?.status ?? base.status,
      requestStatus: overlay?.requestStatus ?? base.requestStatus,
      lastStatusChange: overlay?.lastStatusChange ?? base.lastStatusChange,
      funded: overlay?.funded ?? base.funded,
      validVouches: overlay?.validVouches ?? base.validVouches,
      onChainVouches: overlay?.onChainVouches ?? base.onChainVouches,
      offChainVouches: overlay?.offChainVouches ?? base.offChainVouches,
      evidenceList: mergeEvidence(base.evidenceList, overlay?.appendedEvidence),
      pendingChallenge: overlay?.pendingChallenge,
    }),
    [base, overlay],
  );

  const value = useMemo(
    () => ({
      base,
      effective,
      applyPatch,
      clearOverlay,
    }),
    [base, effective, applyPatch, clearOverlay],
  );

  return (
    <RequestOptimisticContext.Provider value={value}>
      {children}
    </RequestOptimisticContext.Provider>
  );
}

export function useRequestOptimistic() {
  const context = useContext(RequestOptimisticContext);
  if (!context) {
    throw new Error("useRequestOptimistic must be used within RequestOptimisticProvider");
  }
  return context;
}
