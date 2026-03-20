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
import type { ProfileOptimisticBase, ProfileOptimisticOverlay } from "./types";

const OVERLAY_TTL_MS = 5 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;
const MAX_REFRESH_ATTEMPTS = 8;

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

const reconcileOverlay = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
) => {
  if (!overlay) return null;

  const next = { ...overlay };

  if (base.hasPendingRevocation) delete next.pendingRevocation;
  if (base.winningStatus === "transferring" || base.winningStatus === "transferred")
    delete next.pendingTransfer;

  if (
    next.pendingRevocation === undefined &&
    next.pendingTransfer === undefined &&
    next.pendingUpdate === undefined
  ) {
    return null;
  }

  return next;
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

  useEffect(() => {
    setOverlay((current) => reconcileOverlay(base, current));
  }, [base]);

  useEffect(() => {
    if (!overlay) return;
    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
    }, OVERLAY_TTL_MS);
    return () => window.clearTimeout(timeoutId);
  }, [overlay]);

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

  const applyPatch = useCallback((patch: ProfileOptimisticOverlay) => {
    setOverlay((current) => ({
      ...current,
      ...patch,
    }));
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
