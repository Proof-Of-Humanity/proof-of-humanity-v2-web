"use client";

import { useAccount, useBalance } from "wagmi";

import { formatEth } from "utils/misc";

export type EnoughFundsResult = {
  /** Balance can't cover `amount`. Only ever true once data has loaded. */
  insufficient: boolean;
  /** Balance is still resolving — callers should not treat this as insufficient. */
  isLoading: boolean;
  /** The connected wallet's native balance (undefined until loaded). */
  balance?: bigint;
  symbol: string;
  /** Ready-made tooltip message when insufficient, otherwise undefined. */
  message?: string;
};

/**
 * Checks whether the connected wallet has enough native balance to cover a
 * transaction's `amount` on `chainId`. Native token only; gas is not counted.
 */
export default function useEnoughFunds({
  chainId,
  amount,
}: {
  chainId?: number;
  amount?: bigint;
}): EnoughFundsResult {
  const { address } = useAccount();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    chainId,
    query: { enabled: !!address && chainId !== undefined },
  });

  const symbol = balance?.symbol ?? "";
  const balanceValue = balance?.value;
  const isLoading = !!address && amount !== undefined && balanceLoading;
  const insufficient =
    !!address &&
    amount !== undefined &&
    balanceValue !== undefined &&
    balanceValue < amount;

  return {
    insufficient,
    isLoading,
    balance: balanceValue,
    symbol,
    message:
      insufficient && balanceValue !== undefined
        ? `Insufficient balance. You have ${formatEth(balanceValue)} ${symbol}`
        : undefined,
  };
}
