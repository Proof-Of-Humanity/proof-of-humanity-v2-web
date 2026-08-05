import { formatEther, parseEther } from "viem";

/** Claim-wizard funding choice: "full" | "free" | custom amount string. */
export type Funding = "full" | "free" | string;

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

export const computeFundingWei = (
  funding: Funding,
  totalCost: bigint | null,
): bigint | null => {
  if (funding === "free") return 0n;
  if (funding === "full") return totalCost;
  const wei = parseFundingInput(funding);
  return wei !== null && totalCost !== null && wei > totalCost
    ? totalCost
    : wei;
};

export const fundingDisplay = (
  funding: Funding,
  totalCost: bigint | null,
): string => {
  if (funding === "free") return "0";
  if (funding === "full")
    return totalCost !== null ? formatEther(totalCost) : "";
  return funding;
};
