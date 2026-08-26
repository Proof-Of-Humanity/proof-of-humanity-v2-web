import type { Address, Hash } from "viem";

export type ClaimIntent = {
  kind: "create" | "recover" | "renew";
  urlPohId: Hash;
};

export interface RenewalFacts {
  urlPohId: Hash;
  connectedWallet: { address: Address; chainId: number } | null;
  registrationToRenew: { claimer: string; chainId: number };
}

export interface ClaimFacts {
  urlPohId: Hash;
  connectedWallet: { address: Address; chainId: number } | null;
  hasPastVerifiedClaim: boolean;
  selectedMode: "create" | "recover" | null;
  walletActivePohId: Hash | null;
  humanityActiveOnAnyChain: boolean;
}

export type ClaimGate =
  | { type: "proceed"; intent: ClaimIntent }
  | { type: "stay" }
  | { type: "navigate"; to: string }
  | { type: "connect" }
  | { type: "blocked"; reason: "already-registered"; profileId: Hash }
  | { type: "blocked"; reason: "recovery-unavailable" };

export function resolveRenewalGate(facts: RenewalFacts): ClaimGate {
  const { connectedWallet, registrationToRenew, urlPohId } = facts;
  if (!connectedWallet) return { type: "connect" };

  const walletMatchesRegistration =
    registrationToRenew.claimer.toLowerCase() ===
      connectedWallet.address.toLowerCase() &&
    registrationToRenew.chainId === connectedWallet.chainId;

  if (!walletMatchesRegistration) return { type: "connect" };
  return { type: "proceed", intent: { kind: "renew", urlPohId } };
}

export function resolveClaimIntent(facts: ClaimFacts): ClaimGate {
  const { connectedWallet, urlPohId } = facts;
  if (!connectedWallet) return { type: "connect" };

  if (facts.walletActivePohId)
    return {
      type: "blocked",
      reason: "already-registered",
      profileId: facts.walletActivePohId,
    };

  // Never auto-resolve before the user picks create vs recover.
  if (facts.selectedMode === null && facts.hasPastVerifiedClaim)
    return { type: "stay" };

  if (facts.selectedMode === "recover") {
    // The Info step shows guidance text for this case; nothing to resolve.
    if (!facts.hasPastVerifiedClaim) return { type: "stay" };
    if (facts.humanityActiveOnAnyChain)
      return { type: "blocked", reason: "recovery-unavailable" };
    return { type: "proceed", intent: { kind: "recover", urlPohId } };
  }

  // Create on the wallet’s own recoverable URL sends the exact same
  // claimHumanity tx as recovery; only the wording differs (covered by test).
  const walletAddress = connectedWallet.address.toLowerCase();
  const urlBelongsToWallet = urlPohId.toLowerCase() === walletAddress;
  if (!urlBelongsToWallet)
    return { type: "navigate", to: `/${walletAddress}/claim` };
  return { type: "proceed", intent: { kind: "create", urlPohId } };
}
