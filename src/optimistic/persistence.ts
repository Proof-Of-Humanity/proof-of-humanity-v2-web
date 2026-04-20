"use client";

const BIGINT_PREFIX = "__bigint__:";

type PersistedOptimisticState<Action extends string, Overlay> = {
  pendingAction: Action;
  overlay: Overlay;
  expiresAt: number;
};

const stringifyWithBigInt = (value: unknown) =>
  JSON.stringify(value, (_key, currentValue) =>
    typeof currentValue === "bigint"
      ? `${BIGINT_PREFIX}${currentValue.toString()}`
      : currentValue,
  );

const parseWithBigInt = (value: string) =>
  JSON.parse(value, (_key, currentValue) => {
    if (
      typeof currentValue === "string" &&
      currentValue.startsWith(BIGINT_PREFIX)
    ) {
      return BigInt(currentValue.slice(BIGINT_PREFIX.length));
    }

    return currentValue;
  });

export const loadOptimisticState = <Action extends string, Overlay>(
  storageKey?: string,
): PersistedOptimisticState<Action, Overlay> | null => {
  if (!storageKey) return null;

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) return null;

  try {
    const parsed = parseWithBigInt(rawValue) as PersistedOptimisticState<
      Action,
      Overlay
    >;

    // If storage is invalid or expired, discard it.
    if (
      typeof parsed.pendingAction !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !parsed.overlay
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const persistOptimisticState = <Action extends string, Overlay>({
  storageKey,
  pendingAction,
  overlay,
  ttlMs,
}: {
  storageKey?: string;
  pendingAction: Action;
  overlay: Overlay;
  ttlMs: number;
}) => {
  if (!storageKey) return;

  window.localStorage.setItem(
    storageKey,
    stringifyWithBigInt({
      pendingAction,
      overlay,
      expiresAt: Date.now() + ttlMs,
    }),
  );
};

export const clearOptimisticState = (storageKey?: string) => {
  if (!storageKey) return;
  window.localStorage.removeItem(storageKey);
};
