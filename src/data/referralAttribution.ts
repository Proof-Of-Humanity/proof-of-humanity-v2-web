import { supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { getSdk as getAtlasSdk } from "generated/atlas";
import { GraphQLClient } from "graphql-request";
import type { EvidenceFile, RegistrationFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";
import { isAddress } from "viem";

export const REFERRAL_STORAGE_KEY = "poh.referral";
export const REFERRAL_STORAGE_EVENT = "poh.referral.updated";

/**
 * Referral profile data we trust enough to keep client-side until registration
 * submit. The backend still remains the source of truth after attribution.
 */
export interface StoredReferral {
  referrerHumanityId: `0x${string}`;
  name: string;
  photo?: string | null;
}

interface GraphQLErrorLike {
  message?: unknown;
}

/**
 * Parses a referral URL value into the normalized humanity id we send to Atlas.
 * Returns null for malformed values so capture can fail silently.
 */
export const parseReferralHumanityId = (
  value: string,
): `0x${string}` | null => {
  const trimmed = value.trim();
  if (!isAddress(trimmed, { strict: false })) return null;
  return trimmed.toLowerCase() as `0x${string}`;
};

const notifyReferralStorageUpdated = () => {
  if (typeof window === "undefined") return;
  // The native "storage" event does not fire in the tab that made the change.
  window.dispatchEvent(new Event(REFERRAL_STORAGE_EVENT));
};

const shortHumanityId = (id: `0x${string}`) =>
  `${id.slice(0, 6)}..${id.slice(-4)}`;

const getReferralStorageKey = (refereeHumanityId?: `0x${string}` | null) =>
  refereeHumanityId
    ? `${REFERRAL_STORAGE_KEY}.${refereeHumanityId.toLowerCase()}`
    : REFERRAL_STORAGE_KEY;

const isActiveRegistration = (
  registration?: { expirationTime: unknown } | null,
) => {
  if (!registration) return false;
  return (
    BigInt(registration.expirationTime as string) >
    BigInt(Math.floor(Date.now() / 1000))
  );
};

/**
 * Follows registration evidence to the nested claim payload and returns the
 * profile photo when it can be fetched.
 */
export const getRegistrationPhoto = async (evidenceUri?: string) => {
  if (!evidenceUri) return null;

  return ipfsFetch<EvidenceFile>(evidenceUri)
    .then((evidence) =>
      evidence.fileURI
        ? ipfsFetch<RegistrationFile>(evidence.fileURI)
        : Promise.resolve(null),
    )
    .then((registrationFile) => registrationFile?.photo ?? null)
    .catch(() => null);
};

/**
 * Reads the first-touch referral from localStorage and drops corrupt values.
 * Pass a referee id once the claim flow knows who is registering.
 * Returns null on the server, when no referral exists, or when storage is bad.
 */
export const getStoredReferral = (
  refereeHumanityId?: `0x${string}` | null,
): StoredReferral | null => {
  if (typeof window === "undefined") return null;

  const storageKey = getReferralStorageKey(refereeHumanityId);
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<StoredReferral>;
    if (
      !parsed.referrerHumanityId ||
      !parsed.name ||
      !parseReferralHumanityId(parsed.referrerHumanityId)
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return {
      referrerHumanityId: parseReferralHumanityId(parsed.referrerHumanityId)!,
      name: parsed.name,
      photo: parsed.photo ?? null,
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

/**
 * Stores a referral for a specific referee only when none exists for them.
 * This implements first-touch without sharing refs between same-device users.
 */
export const storeReferralForRefereeFirstTouch = (
  refereeHumanityId: `0x${string}`,
  referral: StoredReferral,
) => {
  if (typeof window === "undefined") return false;

  if (getStoredReferral(refereeHumanityId)) return false;

  window.localStorage.setItem(
    getReferralStorageKey(refereeHumanityId),
    JSON.stringify(referral),
  );
  notifyReferralStorageUpdated();
  return true;
};

/**
 * Clears the local referral after successful attribution or user removal.
 */
export const clearStoredReferral = (
  refereeHumanityId?: `0x${string}` | null,
) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getReferralStorageKey(refereeHumanityId));
  notifyReferralStorageUpdated();
};

/**
 * Resolves a referrer against supported PoH subgraphs before sign-in.
 * Returns a display profile only when the referrer currently has an active
 * registration; otherwise capture treats the ref as absent.
 */
export const resolveReferralReferrer = async (
  referrerHumanityId: `0x${string}`,
): Promise<StoredReferral | null> => {
  // The active PoH deployment depends on the chain set, so capture checks every
  // supported subgraph and accepts the first active registration it finds.
  const results = await Promise.allSettled(
    supportedChains.map((chain) =>
      sdk[chain.id].ReferralReferrerProfile({ id: referrerHumanityId }),
    ),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;

    const humanity = result.value.humanity;
    if (!humanity || !isActiveRegistration(humanity.registration)) continue;

    const evidenceUri =
      humanity.requests[0]?.evidenceGroup.evidence[0]?.uri ?? undefined;
    const photo = await getRegistrationPhoto(evidenceUri);

    return {
      referrerHumanityId,
      name:
        humanity.registration?.claimer.name?.trim() ||
        shortHumanityId(referrerHumanityId),
      photo,
    };
  }

  return null;
};

/**
 * Atlas SDK carrying the signed-in user's session token. Referral operations
 * are self-scoped server-side, so no ids are passed from the client.
 */
export const getAuthedAtlasSdk = () => {
  if (!process.env.ATLAS_URI) throw new Error("Missing ATLAS_URI");

  const token =
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem("authToken");
  const client = new GraphQLClient(`${process.env.ATLAS_URI}/graphql`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });

  return getAtlasSdk(client);
};

/**
 * Links the stored referrer to the signed-in submitter in Atlas.
 * Throws on network/GraphQL errors so submit can stop before registration.
 */
export const linkReferralAttribution = async (
  referrerHumanityId: `0x${string}`,
) => getAuthedAtlasSdk().LinkReferralAttribution({ referrerHumanityId });

/**
 * Gets the public Atlas GraphQL message to show when attribution fails.
 */
export const getReferralAttributionErrorMessage = (error: unknown) => {
  const response = (
    error as { response?: { status?: number; errors?: GraphQLErrorLike[] } }
  ).response;

  return response?.errors
    ?.map((item) => item.message)
    .find((item): item is string => typeof item === "string");
};
