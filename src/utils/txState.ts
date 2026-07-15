export type TxCheck = { active: boolean; message?: string };

/**
 * Resolves an ordered list of gating checks into a button's `{ disabled,
 * tooltip }`. Any active check disables; the highest-priority active check that
 * carries a message supplies the tooltip. Message-less checks (e.g. a transient
 * loading flag) still disable but don't claim the tooltip.
 */
export function resolveTxState(checks: TxCheck[]): {
  disabled: boolean;
  tooltip?: string;
} {
  return {
    disabled: checks.some((check) => check.active),
    tooltip: checks.find((check) => check.active && check.message !== undefined)
      ?.message,
  };
}
