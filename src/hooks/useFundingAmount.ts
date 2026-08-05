"use client";

import { useCallback, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { idToChain, nativeCurrencyLabel } from "config/chains";
import useEnoughFunds from "hooks/useEnoughFunds";
import { clampFundingInput, parseFundingInput } from "utils/funding";
import { formatEth } from "utils/misc";
import { resolveTxState, type TxCheck } from "utils/txState";

interface FundingAmountOptions {
  chainId: number;
  funded: bigint;
  totalCost: bigint;
  checks?: TxCheck[];
}

/**
 * Central funding-input state for every surface that lets a user fund a cost
 * (claim deposit, crowdfunding, appeals). Owns the invariant that the wei
 * submitted on-chain is exactly the string displayed — no float round-trips.
 */
export default function useFundingAmount({
  chainId,
  funded,
  totalCost,
  checks = [],
}: FundingAmountOptions) {
  const remainingAmount = totalCost > funded ? totalCost - funded : 0n;
  const maxInput = remainingAmount > 0n ? formatEther(remainingAmount) : "";
  const [input, setInputState] = useState(maxInput);
  // Clamp at entry so the field can never hold sub-wei precision.
  const setInput = useCallback(
    (raw: string) => setInputState(clampFundingInput(raw)),
    [],
  );
  const setMax = useCallback(() => setInputState(maxInput), [maxInput]);
  const { isConnected } = useAccount();
  const connectedChainId = useChainId();
  const unit = nativeCurrencyLabel(chainId);

  // Exact wei callers submit; `null` = invalid, `0n` = empty input.
  const inputAmount = useMemo(() => parseFundingInput(input), [input]);

  const isInvalidInput = inputAmount === null;
  const isZeroInput = inputAmount === 0n;
  const exceedsRemaining =
    inputAmount !== null && inputAmount > remainingAmount;
  const balanceCheck = useEnoughFunds({
    chainId,
    amount: inputAmount !== null && inputAmount > 0n ? inputAmount : undefined,
  });
  const isWrongChain = connectedChainId !== chainId;
  // First active check with a message supplies the tooltip.
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
    setMax,
    inputAmount,
    remainingAmount,
    maxInput,
    unit,
    isWrongChain,
    ...txState,
  };
}
