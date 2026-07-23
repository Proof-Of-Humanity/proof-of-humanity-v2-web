"use client";

import { useCallback, useMemo, useState } from "react";
import { TransactionRejectedRpcError, UserRejectedRequestError } from "viem";
import type { WriteErrorContext, WriteErrorKind } from "contracts/hooks/types";

export const ACTION_STATES = {
  idle: "idle",
  confirmWallet: "confirm-wallet",
  txPending: "tx-pending",
  waitingForIndexer: "waiting-for-indexer",
  walletRejected: "wallet-rejected",
  actionUnavailable: "action-unavailable",
  error: "error",
} as const;

export type ControlledActionState =
  (typeof ACTION_STATES)[keyof typeof ACTION_STATES];

export type ActionFeedback = {
  state: ControlledActionState;
  detail?: string | null;
};

const ACTION_STATE_LABELS: Record<
  Exclude<ControlledActionState, typeof ACTION_STATES.idle>,
  string
> = {
  [ACTION_STATES.confirmWallet]: "Confirm in wallet",
  [ACTION_STATES.txPending]: "Transaction pending",
  [ACTION_STATES.waitingForIndexer]: "Waiting for indexer",
  [ACTION_STATES.walletRejected]: "Transaction was cancelled in your wallet.",
  [ACTION_STATES.actionUnavailable]: "Action is not available right now.",
  [ACTION_STATES.error]: "Transaction failed. Check your wallet and try again.",
};

const CAIP_USER_REJECTED_CODE = 5000;

const hasErrorCode = (error: unknown, codes: number[]) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  codes.includes(Number(error.code));

const isWalletRejectedError = (error: unknown) =>
  error instanceof UserRejectedRequestError ||
  error instanceof TransactionRejectedRpcError ||
  hasErrorCode(error, [
    UserRejectedRequestError.code,
    TransactionRejectedRpcError.code,
    CAIP_USER_REJECTED_CODE,
  ]);

export const WAITING_FOR_INDEXER_TOOLTIP =
  ACTION_STATE_LABELS[ACTION_STATES.waitingForIndexer];

export const isActionStateLoading = (state: ControlledActionState) =>
  state === ACTION_STATES.confirmWallet || state === ACTION_STATES.txPending;

export const isActionStateError = (state: ControlledActionState) =>
  state === ACTION_STATES.walletRejected ||
  state === ACTION_STATES.actionUnavailable ||
  state === ACTION_STATES.error;

const DEFAULT_WRITE_ERROR_MESSAGE =
  "Transaction failed. Check your wallet and try again.";

// Kind-specific copy for terminal write outcomes reported by the write hook.
// "wallet" is absent on purpose: wallet failures fall through to
// `isWalletRejectedError`, which separates a user rejection from other
// submission failures.
const WRITE_ERROR_KIND_MESSAGES: Partial<Record<WriteErrorKind, string>> = {
  reverted: "Transaction failed on-chain.",
  unknown:
    "Could not confirm the transaction. Check the block explorer before retrying.",
};

export const getWriteErrorMessage = (
  error: unknown,
  errorCtx?: WriteErrorContext,
  fallbackMessage = DEFAULT_WRITE_ERROR_MESSAGE,
) =>
  (errorCtx && WRITE_ERROR_KIND_MESSAGES[errorCtx.kind]) ??
  (isWalletRejectedError(error)
    ? ACTION_STATE_LABELS[ACTION_STATES.walletRejected]
    : fallbackMessage);

const getActionFeedbackMessage = ({ state, detail }: ActionFeedback) => {
  if (state === ACTION_STATES.idle) {
    return null;
  }

  return detail || ACTION_STATE_LABELS[state];
};

export default function useActionFeedback() {
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>({
    state: ACTION_STATES.idle,
  });

  const actionState = actionFeedback.state;
  const actionMessage = useMemo(
    () => getActionFeedbackMessage(actionFeedback),
    [actionFeedback],
  );

  const setIdle = useCallback(() => {
    setActionFeedback({ state: ACTION_STATES.idle });
  }, []);

  const setFeedbackState = useCallback(
    (state: ControlledActionState, detail?: string | null) => {
      setActionFeedback(detail ? { state, detail } : { state });
    },
    [],
  );

  const setWriteError = useCallback(
    (
      error: unknown,
      errorCtx?: WriteErrorContext,
      fallbackMessage = DEFAULT_WRITE_ERROR_MESSAGE,
    ) => {
      const message = getWriteErrorMessage(error, errorCtx, fallbackMessage);
      setActionFeedback(
        isWalletRejectedError(error)
          ? { state: ACTION_STATES.walletRejected }
          : { state: ACTION_STATES.error, detail: message },
      );
      return message;
    },
    [],
  );

  const setUnavailable = useCallback((message: string) => {
    setActionFeedback({
      state: ACTION_STATES.actionUnavailable,
      detail: message,
    });
    return message;
  }, []);

  return {
    actionFeedback,
    actionState,
    actionMessage,
    setIdle,
    setFeedbackState,
    setWriteError,
    setUnavailable,
  };
}
