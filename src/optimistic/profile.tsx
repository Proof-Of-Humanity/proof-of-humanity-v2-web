"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProfileOptimisticBase, ProfileOptimisticOverlay } from "./types";

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

export function ProfileOptimisticProvider({
  base,
  enablePolling = true,
  children,
}: {
  base: ProfileOptimisticBase;
  enablePolling?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [overlay, setOverlay] = useState<ProfileOptimisticOverlay | null>(null);
  const hasOverlay = !isOverlayEmpty(overlay);
  const wasOverlayActiveRef = useRef(false);

  useEffect(() => {
    setOverlay((current) => reconcileOverlay(base, current));
  }, [base]);

  useEffect(() => {
    if (!enablePolling) {
      wasOverlayActiveRef.current = hasOverlay;
      return;
    }

    if (wasOverlayActiveRef.current && !hasOverlay) {
      wasOverlayActiveRef.current = false;
      const timeoutId = window.setTimeout(() => {
        router.refresh();
      }, REFRESH_INTERVAL_MS);
      return () => window.clearTimeout(timeoutId);
    }

    wasOverlayActiveRef.current = hasOverlay;
    return;
  }, [enablePolling, hasOverlay, router]);

  useEffect(() => {
    if (!hasOverlay) return;
    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
    }, OVERLAY_TTL_MS);
    return () => window.clearTimeout(timeoutId);
  }, [hasOverlay]);

  useEffect(() => {
    if (!enablePolling || !hasOverlay) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, hasOverlay, router]);

  const applyPatch = useCallback((patch: ProfileOptimisticOverlay) => {
    setOverlay((current) => {
      const next = {
        ...current,
        ...patch,
      };
      return isOverlayEmpty(next) ? null : next;
    });
  }, []);

  const clearOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  const effective = useMemo(
    () => ({
      ...base,
      winningStatus: overlay?.pendingTransfer ? "transferring" : base.winningStatus,
      pendingRevocation: overlay?.pendingRevocation ?? false,
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
