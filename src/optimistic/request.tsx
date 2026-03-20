"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticBase,
  RequestOptimisticOverlay,
} from "./types";

const OVERLAY_TTL_MS = 2 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;
const MAX_REFRESH_ATTEMPTS = 8;

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

  // remove fields that are now present in the base
  if (next.status === base.status) delete next.status;
  if (next.requestStatus === base.requestStatus) delete next.requestStatus;
  if (typeof next.funded === "bigint" && base.funded >= next.funded) delete next.funded;
  if (typeof next.validVouches === "number" && base.validVouches === next.validVouches)
    delete next.validVouches;

  if (next.onChainVouches) {
    const baseSet = new Set(base.onChainVouches.map((item) => item.toLowerCase()));
    const matches = next.onChainVouches.every((item) => baseSet.has(item.toLowerCase()));
    if (matches) delete next.onChainVouches;
  }

  if (next.offChainVouches) {
    const baseSet = new Set(base.offChainVouches.map((item) => item.voucher.toLowerCase()));
    const matches = next.offChainVouches.every((item) =>
      baseSet.has(item.voucher.toLowerCase()),
    );
    if (matches) delete next.offChainVouches;
  }

  if (next.appendedEvidence) {
    const baseUris = new Set(base.evidenceList.map((item) => item.uri));
    const allPresent = next.appendedEvidence.every((item) => baseUris.has(item.uri));
    if (allPresent) delete next.appendedEvidence;
  }

  if (next.pendingChallenge && (base.status === "disputed" || base.currentChallengeDisputeId))
    delete next.pendingChallenge;

  if (
    next.status === undefined &&
    next.requestStatus === undefined &&
    next.funded === undefined &&
    next.validVouches === undefined &&
    next.onChainVouches === undefined &&
    next.offChainVouches === undefined &&
    next.appendedEvidence === undefined &&
    next.pendingChallenge === undefined
  ) {
    return null;
  }

  return next;
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
  const router = useRouter();
  const [overlay, setOverlay] = useState<RequestOptimisticOverlay | null>(null);

  useEffect(() => {
    setOverlay((current) => reconcileOverlay(base, current));
  }, [base]);

  // cleanr overlay after 2 mins
  useEffect(() => {
    if (!overlay) return;
    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
    }, OVERLAY_TTL_MS);
    return () => window.clearTimeout(timeoutId);
  }, [overlay]);

  // refresh in background every 2 seconds for 8 times
  useEffect(() => {
    if (!enablePolling || !overlay) return;

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      router.refresh();

      if (attempts >= MAX_REFRESH_ATTEMPTS) {
        window.clearInterval(intervalId);
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, overlay, router]);

  const applyPatch = useCallback((patch: RequestOptimisticOverlay) => {
    setOverlay((current) => ({
      ...current,
      ...patch,
      appendedEvidence:
        patch.appendedEvidence || current?.appendedEvidence
          ? mergeEvidence(current?.appendedEvidence ?? [], patch.appendedEvidence)
          : undefined,
    }));
  }, []);

  const clearOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  const effective = useMemo(
    () => ({
      ...base,
      status: overlay?.status ?? base.status,
      requestStatus: overlay?.requestStatus ?? base.requestStatus,
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
