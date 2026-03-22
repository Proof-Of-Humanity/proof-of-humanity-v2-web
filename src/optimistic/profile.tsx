"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { ProfileOptimisticBase, ProfileOptimisticOverlay } from "./types";
import useOptimisticOverlay from "./useOptimisticOverlay";

const OVERLAY_TTL_MS = 5 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;

interface ProfileOptimisticContextValue {
  base: ProfileOptimisticBase;
  effective: ProfileOptimisticBase & {
    pendingRevocation: boolean;
    pendingTransfer: boolean;
    pendingUpdate: boolean;
  };
  applyPatch: (patch: ProfileOptimisticOverlay) => void;
  clearOverlay: () => void;
}

const ProfileOptimisticContext =
  createContext<ProfileOptimisticContextValue | null>(null);

const isOverlayEmpty = (overlay: ProfileOptimisticOverlay | null) =>
  !overlay ||
  (overlay.pendingRevocation === undefined &&
    overlay.pendingTransfer === undefined &&
    overlay.pendingUpdate === undefined);

const reconcileOverlay = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
) => {
  if (!overlay) return null;

  const next = { ...overlay };
  let changed = false;

  if (base.hasPendingRevocation && next.pendingRevocation !== undefined) {
    delete next.pendingRevocation;
    changed = true;
  }
  if (
    (base.winningStatus === "transferring" || base.winningStatus === "transferred") &&
    next.pendingTransfer !== undefined
  ) {
    delete next.pendingTransfer;
    changed = true;
  }

  if (isOverlayEmpty(next)) return null;

  return changed ? next : overlay;
};

const mergePatch = (
  current: ProfileOptimisticOverlay | null,
  patch: ProfileOptimisticOverlay,
) => {
  const next = {
    ...current,
    ...patch,
  };

  return isOverlayEmpty(next) ? null : next;
};

export function ProfileOptimisticProvider({
  base,
  enablePolling = true,
  children,
}: {
  base: ProfileOptimisticBase;
  enablePolling?: boolean;
  children: ReactNode;
}) {
  const { overlay, applyPatch, clearOverlay } = useOptimisticOverlay({
    base,
    enablePolling,
    ttlMs: OVERLAY_TTL_MS,
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    refreshOnClear: true,
    isOverlayEmpty,
    reconcileOverlay,
    mergePatch,
  });

  const effective = useMemo(
    () => ({
      ...base,
      winningStatus: overlay?.pendingTransfer ? "transferring" : base.winningStatus,
      pendingRevocation: base.hasPendingRevocation || (overlay?.pendingRevocation ?? false),
      pendingTransfer: overlay?.pendingTransfer ?? false,
      pendingUpdate: overlay?.pendingUpdate ?? false,
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
    <ProfileOptimisticContext.Provider value={value}>
      {children}
    </ProfileOptimisticContext.Provider>
  );
}

export function useProfileOptimistic() {
  const context = useContext(ProfileOptimisticContext);
  if (!context) {
    throw new Error("useProfileOptimistic must be used within ProfileOptimisticProvider");
  }
  return context;
}
