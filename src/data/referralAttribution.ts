import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { isAddress } from "viem";

export const PENDING_KEY = "poh.referral";
export const REFERRAL_STORAGE_EVENT = "poh.referral.updated";

export interface StoredReferral {
  referrerHumanityId: `0x${string}`;
  name: string;
  evidenceUri?: string | null;
}

export const parseReferralHumanityId = (
  value: string,
): `0x${string}` | null => {
  const trimmed = value.trim();
  return isAddress(trimmed, { strict: false })
    ? (trimmed.toLowerCase() as `0x${string}`)
    : null;
};

// Notify other tabs that the referral has been updated.
const notify = () => window.dispatchEvent(new Event(REFERRAL_STORAGE_EVENT));
const pinKey = (id: `0x${string}`) => `${PENDING_KEY}.${id.toLowerCase()}`;
const storage = (kind: "local" | "session") =>
  kind === "local" ? localStorage : sessionStorage;

export const persistReferral = (
  kind: "local" | "session",
  key: string,
  value: unknown,
) => {
  try {
    storage(kind).setItem(key, JSON.stringify(value));
    notify();
    return true;
  } catch {
    return false;
  }
};

/** @param refereeHumanityId `null` referee → tab pending; otherwise the wallet pin. */
export const getStoredReferral = (
  refereeHumanityId?: `0x${string}` | null,
): StoredReferral | null => {
  const kind = refereeHumanityId ? "local" : "session";
  const key = refereeHumanityId ? pinKey(refereeHumanityId) : PENDING_KEY;
  const forget = () => {
    try {
      storage(kind).removeItem(key);
    } catch {
      // Blocked storage.
    }
  };

  let raw: string | null;
  try {
    raw = storage(kind).getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: Partial<StoredReferral>;
  try {
    parsed = JSON.parse(raw) as Partial<StoredReferral>;
  } catch {
    forget();
    return null;
  }

  const referrerHumanityId =
    typeof parsed.referrerHumanityId === "string"
      ? parseReferralHumanityId(parsed.referrerHumanityId)
      : null;
  if (!referrerHumanityId || typeof parsed.name !== "string" || !parsed.name) {
    forget();
    return null;
  }

  return {
    referrerHumanityId,
    name: parsed.name,
    evidenceUri:
      typeof parsed.evidenceUri === "string" ? parsed.evidenceUri : null,
  };
};

export const pinPendingReferral = (refereeHumanityId: `0x${string}`) => {
  if (getStoredReferral(refereeHumanityId)) return;
  const pending = getStoredReferral(null);
  if (
    !pending ||
    pending.referrerHumanityId === refereeHumanityId.toLowerCase()
  )
    return;
  if (!persistReferral("local", pinKey(refereeHumanityId), pending)) return;
  try {
    storage("session").removeItem(PENDING_KEY);
    notify();
  } catch {
    // Blocked storage.
  }
};

export const clearReferral = (refereeHumanityId: `0x${string}`) => {
  try {
    storage("local").removeItem(pinKey(refereeHumanityId));
    storage("session").removeItem(PENDING_KEY);
    notify();
  } catch {
    // Blocked storage.
  }
};

/** `null` = expired / unregistered. Throws on any failed lookup so a partial
 *  outage is not treated as valid or expired. */
export const resolveReferralReferrer = async (
  referrerHumanityId: `0x${string}`,
): Promise<StoredReferral | null> => {
  const lookups = await Promise.all(
    supportedChains.map((chain) =>
      sdk[chain.id].ReferralReferrerProfile({ id: referrerHumanityId }),
    ),
  );

  const now = BigInt(Math.floor(Date.now() / 1000));
  for (const { humanity } of lookups) {
    if (!humanity) continue;
    const { registration } = humanity;
    if (!registration || BigInt(registration.expirationTime) <= now) continue;

    return {
      referrerHumanityId,
      name:
        registration.claimer.name?.trim() ||
        `${referrerHumanityId.slice(0, 6)}..${referrerHumanityId.slice(-4)}`,
      evidenceUri:
        humanity.winnerClaim[0]?.evidenceGroup.evidence[0]?.uri ?? null,
    };
  }

  return null;
};

/** True when this humanity already has a claim request on any healthy chain.
 *  Fail-open: a subgraph outage is not treated as a prior claim. */
export const refereeHasClaimRequest = async (
  refereeHumanityId: `0x${string}`,
): Promise<boolean> => {
  const lookups = await Promise.allSettled(
    supportedChains.map((chain) =>
      sdk[chain.id].ReferralRefereePriorClaim({ id: refereeHumanityId }),
    ),
  );
  return lookups.some(
    (lookup) =>
      lookup.status === "fulfilled" &&
      (lookup.value.humanity?.requests.length ?? 0) > 0,
  );
};
