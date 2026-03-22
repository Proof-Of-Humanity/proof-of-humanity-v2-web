"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticBase,
  RequestOptimisticOverlay,
  RequestPendingAction,
} from "./types";

const OVERLAY_TTL_MS = 2 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;

interface RequestOptimisticContextValue {
  base: RequestOptimisticBase;
  effective: RequestOptimisticBase;
  pendingAction: RequestPendingAction | null;
  pendingEvidenceItem: OptimisticEvidenceItem | null;
  applyAction: (
    action: RequestPendingAction,
    patch: RequestOptimisticOverlay,
  ) => void;
  clearAction: () => void;
}

const RequestOptimisticContext =
  createContext<RequestOptimisticContextValue | null>(null);

const normalizeEvidenceUri = (value: string) => value.trim();

const isRequestActionReconciled = (
  base: RequestOptimisticBase,
  overlay: RequestOptimisticOverlay | null,
  pendingAction: RequestPendingAction | null,
) => {
  if (!overlay || !pendingAction) return false;

  switch (pendingAction) {
    case "fund":
      return typeof overlay.funded === "bigint" && base.funded >= overlay.funded;
    case "challenge":
    case "withdraw":
    case "advance":
    case "execute":
      return (
        overlay.status === base.status &&
        overlay.requestStatus === base.requestStatus &&
        typeof overlay.lastStatusChange === "number" &&
        base.lastStatusChange >= overlay.lastStatusChange
      );
    case "evidence":
      return (
        !!overlay.evidenceList &&
        overlay.evidenceList.every((item) =>
          base.evidenceList.some(
            (baseItem) =>
              normalizeEvidenceUri(baseItem.uri) ===
              normalizeEvidenceUri(item.uri),
          ),
        )
      );
    case "vouch":
      return (
        typeof overlay.validVouches === "number" &&
        base.validVouches >= overlay.validVouches
      );
    case "removeVouch":
      return (
        typeof overlay.validVouches === "number" &&
        base.validVouches <= overlay.validVouches
      );
    default:
      return false;
  }
};

const mergeRequest = (
  base: RequestOptimisticBase,
  overlay: RequestOptimisticOverlay | null,
): RequestOptimisticBase => ({
  ...base,
  status: overlay?.status ?? base.status,
  requestStatus: overlay?.requestStatus ?? base.requestStatus,
  lastStatusChange: overlay?.lastStatusChange ?? base.lastStatusChange,
  funded: overlay?.funded ?? base.funded,
  validVouches: overlay?.validVouches ?? base.validVouches,
  onChainVouches: overlay?.onChainVouches ?? base.onChainVouches,
  offChainVouches: overlay?.offChainVouches ?? base.offChainVouches,
  evidenceList: base.evidenceList,
});

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
  const [pendingAction, setPendingAction] = useState<RequestPendingAction | null>(
    null,
  );

  const effective = useMemo(() => mergeRequest(base, overlay), [base, overlay]);
  const pendingEvidenceItem = useMemo(
    () =>
      pendingAction === "evidence" && overlay?.evidenceList?.length
        ? overlay.evidenceList[0]
        : null,
    [overlay, pendingAction],
  );
  const hasActiveAction = pendingAction !== null;

  useEffect(() => {
    if (!isRequestActionReconciled(base, overlay, pendingAction)) return;

    setOverlay(null);
    setPendingAction(null);
  }, [base, overlay, pendingAction]);

  useEffect(() => {
    if (!hasActiveAction) return;

    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
      setPendingAction(null);
    }, OVERLAY_TTL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasActiveAction]);

  useEffect(() => {
    if (!enablePolling || !hasActiveAction) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, hasActiveAction, router]);

  const applyAction = useCallback(
    (action: RequestPendingAction, patch: RequestOptimisticOverlay) => {
      setPendingAction(action);
      setOverlay(patch);
    },
    [],
  );

  const clearAction = useCallback(() => {
    setOverlay(null);
    setPendingAction(null);
  }, []);

  const value = useMemo(
    () => ({
      base,
      effective,
      pendingAction,
      pendingEvidenceItem,
      applyAction,
      clearAction,
    }),
    [
      base,
      effective,
      pendingAction,
      pendingEvidenceItem,
      applyAction,
      clearAction,
    ],
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
