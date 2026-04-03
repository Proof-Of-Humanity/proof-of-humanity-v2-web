"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import type {
  ProfileOptimisticBase,
  ProfileOptimisticOverlay,
  ProfilePendingAction,
} from "./types";
import {
  clearOptimisticState,
  loadOptimisticState,
  persistOptimisticState,
} from "./persistence";

const OVERLAY_TTL_MS = 5 * 60 * 1000;
const REFRESH_INTERVAL_MS = 2000;

type ProfileReconcileConfig = Record<
  ProfilePendingAction,
  {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) => boolean;
  }
>;

interface ProfileOptimisticContextValue {
  base: ProfileOptimisticBase;
  effective: ProfileOptimisticBase;
  pendingAction: ProfilePendingAction | null;
  applyAction: (
    action: ProfilePendingAction,
    patch: ProfileOptimisticOverlay,
  ) => void;
  clearAction: () => void;
}

type ProfileOptimisticState = {
  overlay: ProfileOptimisticOverlay | null;
  pendingAction: ProfilePendingAction | null;
};

const ProfileOptimisticContext =
  createContext<ProfileOptimisticContextValue | null>(null);

const PROFILE_RECONCILE_CONFIG = {
  revoke: {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) =>
      overlay.pendingRevocation !== undefined &&
      base.pendingRevocation === true,
  },
  transfer: {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) =>
      (overlay.winningStatus !== undefined &&
        base.winningStatus === overlay.winningStatus) ||
      (overlay.lastTransferTimestamp !== undefined &&
        base.lastTransferTimestamp !== undefined &&
        base.lastTransferTimestamp !== overlay.lastTransferTimestamp) ||
      (overlay.hasPendingTransferRelay !== undefined &&
        base.hasPendingTransferRelay === overlay.hasPendingTransferRelay),
  },
  update: {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) =>
      overlay.hasPendingUpdateRelay !== undefined &&
      base.hasPendingUpdateRelay === overlay.hasPendingUpdateRelay,
  },
  relayTransfer: {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) =>
      overlay.hasPendingTransferRelay !== undefined &&
      base.hasPendingTransferRelay === overlay.hasPendingTransferRelay,
  },
  relayUpdate: {
    isReconciled: (
      base: ProfileOptimisticBase,
      overlay: ProfileOptimisticOverlay,
    ) =>
      overlay.hasPendingUpdateRelay !== undefined &&
      base.hasPendingUpdateRelay === overlay.hasPendingUpdateRelay,
  },
} as const satisfies ProfileReconcileConfig;

const mergeProfile = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
) => ({
  winningStatus: overlay?.winningStatus ?? base.winningStatus,
  lastTransferTimestamp:
    overlay?.lastTransferTimestamp ?? base.lastTransferTimestamp,
  pendingRevocation: overlay?.pendingRevocation ?? base.pendingRevocation,
  hasPendingUpdateRelay:
    overlay?.hasPendingUpdateRelay ?? base.hasPendingUpdateRelay,
  hasPendingTransferRelay:
    overlay?.hasPendingTransferRelay ?? base.hasPendingTransferRelay,
});

const isProfileActionReconciled = (
  base: ProfileOptimisticBase,
  overlay: ProfileOptimisticOverlay | null,
  pendingAction: ProfilePendingAction | null,
) => {
  if (!overlay || !pendingAction) return false;
  return PROFILE_RECONCILE_CONFIG[pendingAction].isReconciled(base, overlay);
};

const getInitialProfileState = (
  scopedStorageKey?: string,
): ProfileOptimisticState => {
  const persisted = loadOptimisticState<
    ProfilePendingAction,
    ProfileOptimisticOverlay
  >(scopedStorageKey);

  return {
    overlay: persisted?.overlay ?? null,
    pendingAction: persisted?.pendingAction ?? null,
  };
};

export function ProfileOptimisticProvider({
  base,
  enablePolling = true,
  storageKey,
  account,
  children,
}: {
  base: ProfileOptimisticBase;
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
    <ProfileOptimisticProviderInner
      key={scopedStorageKey ?? "profile-optimistic-local"}
      base={base}
      enablePolling={enablePolling}
      scopedStorageKey={scopedStorageKey}
    >
      {children}
    </ProfileOptimisticProviderInner>
  );
}

function ProfileOptimisticProviderInner({
  base,
  enablePolling,
  scopedStorageKey,
  children,
}: {
  base: ProfileOptimisticBase;
  enablePolling: boolean;
  scopedStorageKey?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [{ overlay, pendingAction }, setOptimisticState] =
    useState<ProfileOptimisticState>(() =>
      getInitialProfileState(scopedStorageKey),
    );

  const clearActiveState = useCallback(() => {
    setOptimisticState({
      overlay: null,
      pendingAction: null,
    });
    clearOptimisticState(scopedStorageKey);
  }, [scopedStorageKey]);

  const applyAction = useCallback(
    (action: ProfilePendingAction, patch: ProfileOptimisticOverlay) => {
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

  const effective = useMemo(() => mergeProfile(base, overlay), [base, overlay]);

  useEffect(() => {
    if (!isProfileActionReconciled(base, overlay, pendingAction)) return;

    clearActiveState();
  }, [base, overlay, pendingAction, clearActiveState]);

  useEffect(() => {
    if (pendingAction === null) return;

    const timeoutId = window.setTimeout(clearActiveState, OVERLAY_TTL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pendingAction, clearActiveState]);

  useEffect(() => {
    if (!enablePolling || pendingAction === null) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, pendingAction, router]);

  const value = useMemo(
    () => ({
      base,
      effective,
      pendingAction,
      applyAction,
      clearAction: clearActiveState,
    }),
    [base, effective, pendingAction, applyAction, clearActiveState],
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
    throw new Error(
      "useProfileOptimistic must be used within ProfileOptimisticProvider",
    );
  }
  return context;
}
