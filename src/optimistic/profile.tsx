"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
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
  overlay: ProfileOptimisticOverlay | null;
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

const EMPTY_PROFILE_BASE: ProfileOptimisticBase = {
  winningStatus: undefined,
  pendingRevocation: false,
  lastTransferTimestamp: undefined,
  hasPendingUpdateRelay: false,
  hasPendingTransferRelay: false,
};

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

const mergeBase = (
  parentBase: ProfileOptimisticBase,
  base: Partial<ProfileOptimisticBase>,
): ProfileOptimisticBase => ({
  ...parentBase,
  ...base,
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
  base: Partial<ProfileOptimisticBase>;
  enablePolling?: boolean;
  storageKey?: string;
  account?: string;
  children: ReactNode;
}) {
  const parentContext = useContext(ProfileOptimisticContext);
  const { address } = useAccount();
  const normalizedAccount = (account ?? address)?.toLowerCase();
  const scopedStorageKey =
    storageKey && normalizedAccount
      ? `${storageKey}:${normalizedAccount}`
      : undefined;

  if (parentContext) {
    return (
      <NestedProfileOptimisticProvider
        parentContext={parentContext}
        base={base}
      >
        {children}
      </NestedProfileOptimisticProvider>
    );
  }

  return (
    <ProfileOptimisticProviderInner
      key={scopedStorageKey ?? "profile-optimistic-local"}
      base={mergeBase(EMPTY_PROFILE_BASE, base)}
      enablePolling={enablePolling}
      scopedStorageKey={scopedStorageKey}
    >
      {children}
    </ProfileOptimisticProviderInner>
  );
}

function NestedProfileOptimisticProvider({
  parentContext,
  base,
  children,
}: {
  parentContext: ProfileOptimisticContextValue;
  base: Partial<ProfileOptimisticBase>;
  children: ReactNode;
}) {
  const mergedBase = useMemo(
    () => mergeBase(parentContext.base, base),
    [parentContext.base, base],
  );
  const effective = useMemo(
    () => mergeProfile(mergedBase, parentContext.overlay),
    [mergedBase, parentContext.overlay],
  );

  useEffect(() => {
    // Some profile actions reconcile against cross-chain facts that only exist
    // inside this nested subtree. When that child-owned base catches up, it must
    // clear the shared parent action or the rest of the actions area stays stuck
    // in the waiting-for-indexer state.
    const isReconciled = isProfileActionReconciled(
      mergedBase,
      parentContext.overlay,
      parentContext.pendingAction,
    );
    if (!isReconciled) return;

    parentContext.clearAction();
  }, [
    mergedBase,
    parentContext.overlay,
    parentContext.pendingAction,
    parentContext.clearAction,
  ]);

  const value = useMemo(
    () => ({
      ...parentContext,
      base: mergedBase,
      effective,
    }),
    [parentContext, mergedBase, effective],
  );

  return (
    <ProfileOptimisticContext.Provider value={value}>
      {children}
    </ProfileOptimisticContext.Provider>
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
  const [isRefreshPending, startRefreshTransition] = useTransition();
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
    const isReconciled = isProfileActionReconciled(
      base,
      overlay,
      pendingAction,
    );
    if (!isReconciled) return;

    clearActiveState();
  }, [base, overlay, pendingAction, clearActiveState]);

  useEffect(() => {
    if (pendingAction === null) return;

    const timeoutId = window.setTimeout(clearActiveState, OVERLAY_TTL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pendingAction, clearActiveState]);

  useEffect(() => {
    if (!enablePolling || pendingAction === null || isRefreshPending) return;

    const timeoutId = window.setTimeout(() => {
      startRefreshTransition(() => {
        router.refresh();
      });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    enablePolling,
    pendingAction,
    router,
    isRefreshPending,
    startRefreshTransition,
  ]);

  const value = useMemo(
    () => ({
      base,
      overlay,
      effective,
      pendingAction,
      applyAction,
      clearAction: clearActiveState,
    }),
    [base, overlay, effective, pendingAction, applyAction, clearActiveState],
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
