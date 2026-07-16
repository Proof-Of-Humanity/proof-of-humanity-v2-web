"use client";

import { useCallback, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { idToChain, nativeCurrencyLabel } from "config/chains";
import useEnoughFunds from "hooks/useEnoughFunds";
import { formatEth } from "utils/misc";
import { resolveTxState, type TxCheck } from "utils/txState";

interface FundingAmountOptions {
  chainId: number;
  funded: bigint;
  totalCost: bigint;
  checks?: TxCheck[];
  /** Pre-fill (and reset) the input with the full remaining amount. */
  defaultToRemaining?: boolean;
}

export default function useFundingAmount({
  chainId,
  funded,
  totalCost,
  checks = [],
  defaultToRemaining = false,
}: FundingAmountOptions) {
  const remainingAmount = totalCost > funded ? totalCost - funded : 0n;
  const defaultInput =
    defaultToRemaining && remainingAmount > 0n
      ? formatEther(remainingAmount)
      : "";
  const [input, setInput] = useState(defaultInput);
  // `defaultInput` is recomputed every render, so reset restores the *current*
  // remaining amount, not the one captured on mount.
  const resetInput = useCallback(() => setInput(defaultInput), [defaultInput]);
  const { isConnected } = useAccount();
  const connectedChainId = useChainId();
  const unit = nativeCurrencyLabel(chainId);

  // Parsed wei value of the input. Sentinels: `null` = unparsable text,
  // `0n` = empty input (negatives are clamped to 0).
  const inputAmount = useMemo(() => {
    if (!input) return 0n;
    try {
      const parsed = parseEther(input);
      return parsed < 0n ? 0n : parsed;
    } catch {
      return null;
    }
  }, [input]);

  const isInvalidInput = inputAmount === null;
  const isZeroInput = inputAmount === 0n;
  const exceedsRemaining =
    inputAmount !== null && inputAmount > remainingAmount;
  const balanceCheck = useEnoughFunds({
    chainId,
    // `undefined` skips the balance check until there's a valid positive amount.
    amount: inputAmount !== null && inputAmount > 0n ? inputAmount : undefined,
  });
  const isWrongChain = connectedChainId !== chainId;
  // Order matters: the first active check with a message supplies the tooltip,
  // so checks go from most fundamental (connection) to most specific (balance).
  const txState = resolveTxState([
    ...checks,
    { active: !isConnected, message: "Please connect your wallet" },
    {
      active: isWrongChain,
      message: `Switch your chain above to ${idToChain(chainId)?.name || "the correct chain"}`,
    },
    { active: !input, message: "Please enter an amount to fund" },
    { active: isInvalidInput, message: "Please enter a valid amount" },
    { active: isZeroInput, message: "Amount must be greater than 0" },
    {
      active: exceedsRemaining,
      message: `Amount exceeds remaining needed (${formatEth(remainingAmount)} ${unit})`,
    },
    { active: balanceCheck.isLoading, message: "Checking balance" },
    { active: balanceCheck.insufficient, message: balanceCheck.message },
  ]);

  return {
    input,
    setInput,
    resetInput,
    inputAmount,
    remainingAmount,
    unit,
    isWrongChain,
    ...txState,
  };
}
