"use client";

import { useCallback, useMemo, useState } from "react";
import { TransactionRejectedRpcError, UserRejectedRequestError } from "viem";

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
      fallbackMessage = "Transaction failed. Check your wallet and try again.",
    ) => {
      if (isWalletRejectedError(error)) {
        setActionFeedback({
          state: ACTION_STATES.walletRejected,
        });
        return ACTION_STATE_LABELS[ACTION_STATES.walletRejected];
      }

      setActionFeedback({
        state: ACTION_STATES.error,
        detail: fallbackMessage,
      });
      return fallbackMessage;
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
