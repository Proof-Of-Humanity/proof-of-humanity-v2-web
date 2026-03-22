"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  ProfileOptimisticBase,
  ProfileOptimisticOverlay,
  ProfilePendingAction,
} from "./types";

const OVERLAY_TTL_MS = 5 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;

interface ProfileOptimisticContextValue {
  base: ProfileOptimisticBase;
  effective: ProfileOptimisticBase & {
    pendingUpdate: boolean;
  };
  pendingAction: ProfilePendingAction | null;
  applyAction: (
    action: ProfilePendingAction,
    patch: ProfileOptimisticOverlay,
  ) => void;
  clearAction: () => void;
}

const ProfileOptimisticContext =
  createContext<ProfileOptimisticContextValue | null>(null);

const mergeProfile = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
) => ({
  winningStatus: overlay?.winningStatus ?? base.winningStatus,
  pendingRevocation: overlay?.pendingRevocation ?? base.pendingRevocation,
  pendingUpdate: overlay?.pendingUpdate ?? false,
});

const isProfileActionReconciled = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
  pendingAction: ProfilePendingAction | null,
) => {
  if (!overlay || !pendingAction) return false;

  switch (pendingAction) {
    case "revoke":
      return (
        overlay.pendingRevocation !== undefined &&
        base.pendingRevocation === overlay.pendingRevocation
      );
    case "transfer":
      return (
        overlay.winningStatus !== undefined &&
        base.winningStatus === overlay.winningStatus
      );
    case "update":
      return false;
    default:
      return false;
  }
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
  const [pendingAction, setPendingAction] = useState<ProfilePendingAction | null>(
    null,
  );

  const effective = useMemo(() => mergeProfile(base, overlay), [base, overlay]);
  const hasActiveAction = pendingAction !== null;

  useEffect(() => {
    if (!isProfileActionReconciled(base, overlay, pendingAction)) return;

    setOverlay((current) => {
      if (!current) return null;

      if (pendingAction === "revoke") {
        const next = { ...current };
        delete next.pendingRevocation;
        return Object.keys(next).length ? next : null;
      }

      if (pendingAction === "transfer") {
        const next = { ...current };
        delete next.winningStatus;
        return Object.keys(next).length ? next : null;
      }

      return current;
    });
    setPendingAction(null);
  }, [base, overlay, pendingAction]);

  useEffect(() => {
    if (!hasActiveAction && !overlay?.pendingUpdate) return;

    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
      setPendingAction(null);
    }, OVERLAY_TTL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasActiveAction, overlay]);

  useEffect(() => {
    if (!enablePolling || (!hasActiveAction && !overlay?.pendingUpdate)) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, hasActiveAction, overlay, router]);

  const applyAction = useCallback(
    (action: ProfilePendingAction, patch: ProfileOptimisticOverlay) => {
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
      applyAction,
      clearAction,
    }),
    [base, effective, pendingAction, applyAction, clearAction],
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
