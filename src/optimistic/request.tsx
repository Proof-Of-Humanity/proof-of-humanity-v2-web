"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import type {
  OptimisticEvidenceItem,
  RequestOptimisticBase,
  RequestOptimisticOverlay,
  RequestPendingAction,
} from "./types";
import {
  clearOptimisticState,
  loadOptimisticState,
  persistOptimisticState,
} from "./persistence";

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

type RequestOptimisticState = {
  overlay: RequestOptimisticOverlay | null;
  pendingAction: RequestPendingAction | null;
};

const RequestOptimisticContext =
  createContext<RequestOptimisticContextValue | null>(null);

const normalizeEvidenceUri = (value: string) => value.trim();
const hasRequestStatusReconciled = (
  base: RequestOptimisticBase,
  overlay: RequestOptimisticOverlay,
) =>
  overlay.status === base.status &&
  overlay.requestStatus === base.requestStatus;

const REQUEST_RECONCILE_CHECKS = {
  fund: (base: RequestOptimisticBase, overlay: RequestOptimisticOverlay) =>
    typeof overlay.funded === "bigint" && base.funded >= overlay.funded,
  challenge: hasRequestStatusReconciled,
  withdraw: hasRequestStatusReconciled,
  advance: hasRequestStatusReconciled,
  execute: hasRequestStatusReconciled,
  evidence: (base: RequestOptimisticBase, overlay: RequestOptimisticOverlay) =>
    !!overlay.evidenceList &&
    overlay.evidenceList.every((item) =>
      base.evidenceList.some(
        (baseItem) =>
          normalizeEvidenceUri(baseItem.uri) === normalizeEvidenceUri(item.uri),
      ),
    ),
  vouch: (base: RequestOptimisticBase, overlay: RequestOptimisticOverlay) =>
    typeof overlay.validVouches === "number" &&
    base.validVouches >= overlay.validVouches,
  removeVouch: (base: RequestOptimisticBase, overlay: RequestOptimisticOverlay) =>
    typeof overlay.validVouches === "number" &&
    base.validVouches <= overlay.validVouches,
} satisfies Record<
  RequestPendingAction,
  (base: RequestOptimisticBase, overlay: RequestOptimisticOverlay) => boolean
>;

const isRequestActionReconciled = (
  base: RequestOptimisticBase,
  overlay: RequestOptimisticOverlay | null,
  pendingAction: RequestPendingAction | null,
) => {
  if (!overlay || !pendingAction) return false;

  return REQUEST_RECONCILE_CHECKS[pendingAction](base, overlay);
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

const getInitialRequestState = (
  scopedStorageKey?: string,
): RequestOptimisticState => {
  const persisted = loadOptimisticState<
    RequestPendingAction,
    RequestOptimisticOverlay
  >(scopedStorageKey);

  return {
    overlay: persisted?.overlay ?? null,
    pendingAction: persisted?.pendingAction ?? null,
  };
};

export function RequestOptimisticProvider({
  base,
  enablePolling = true,
  storageKey,
  account,
  children,
}: {
  base: RequestOptimisticBase;
  enablePolling?: boolean;
  storageKey?: string;
  account?: string;
  children: ReactNode;
}) {
  const { address } = useAccount();
  const normalizedAccount = (account ?? address)?.toLowerCase();
  const scopedStorageKey =
    storageKey && normalizedAccount
      ? `${storageKey}:${normalizedAccount}`
      : undefined;

  return (
    <RequestOptimisticProviderInner
      key={scopedStorageKey ?? "request-optimistic-local"}
      base={base}
      enablePolling={enablePolling}
      scopedStorageKey={scopedStorageKey}
    >
      {children}
    </RequestOptimisticProviderInner>
  );
}

function RequestOptimisticProviderInner({
  base,
  enablePolling,
  scopedStorageKey,
  children,
}: {
  base: RequestOptimisticBase;
  enablePolling: boolean;
  scopedStorageKey?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [{ overlay, pendingAction }, setOptimisticState] =
    useState<RequestOptimisticState>(() => getInitialRequestState(scopedStorageKey));

  const clearActiveState = useCallback(() => {
    setOptimisticState({
      overlay: null,
      pendingAction: null,
    });
    clearOptimisticState(scopedStorageKey);
  }, [scopedStorageKey]);

  const applyAction = useCallback(
    (action: RequestPendingAction, patch: RequestOptimisticOverlay) => {
      setOptimisticState({
        overlay: patch,
        pendingAction: action,
      });
      persistOptimisticState({
        storageKey: scopedStorageKey,
        pendingAction: action,
        overlay: patch,
        ttlMs: OVERLAY_TTL_MS,
      });
    },
    [scopedStorageKey],
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

    clearActiveState();
  }, [base, overlay, pendingAction, clearActiveState]);

  useEffect(() => {
    if (!hasActiveAction) return;

    const timeoutId = window.setTimeout(clearActiveState, OVERLAY_TTL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasActiveAction, clearActiveState]);

  useEffect(() => {
    if (!enablePolling || !hasActiveAction) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, hasActiveAction, router]);

  const value = useMemo(
    () => ({
      base,
      effective,
      pendingAction,
      pendingEvidenceItem,
      applyAction,
      clearAction: clearActiveState,
    }),
    [
      base,
      effective,
      pendingAction,
      pendingEvidenceItem,
      applyAction,
      clearActiveState,
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
