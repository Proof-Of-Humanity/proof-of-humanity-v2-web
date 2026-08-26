import { parseEther } from "viem";

// Truncate plain decimals to 18 fractional digits (1 wei). Anything else
// (scientific notation, signs, garbage) is left for parseFundingInput to reject.
export const clampFundingInput = (raw: string): string => {
  const match = raw.match(/^(\d*\.\d{18})\d+$/);
  return match?.[1] ?? raw;
};

// Strict string → wei. `null` = invalid (unparsable, negative, or more
// precision than the chain can represent — parseEther would silently round it).
export const parseFundingInput = (raw: string): bigint | null => {
  const trimmed = raw.trim();
  if (trimmed === "") return 0n;
  const fraction = trimmed.split(".")[1];
  if (fraction !== undefined && fraction.length > 18) return null;
  let wei: bigint;
  try {
    wei = parseEther(trimmed);
  } catch {
    return null;
  }
  return wei < 0n ? null : wei;
};

export interface FundingAmount {
  /** What will be sent, capped at the deposit. `null` when not spendable. */
  wei: bigint | null;
  /** More than the deposit was typed — callers block submission and say so. */
  overCap: boolean;
}

export const resolveFunding = (
  raw: string,
  totalCost: bigint | null,
): FundingAmount => {
  const wei = parseFundingInput(raw);
  if (wei === null) return { wei: null, overCap: false };
  if (totalCost === null)
    return { wei: wei === 0n ? 0n : null, overCap: false };
  return wei > totalCost
    ? { wei: totalCost, overCap: true }
    : { wei, overCap: false };
};
