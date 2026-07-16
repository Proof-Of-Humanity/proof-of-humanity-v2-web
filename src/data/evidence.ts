import { supportedChains } from "config/chains";
import { getClaimerData } from "data/claimer";
import type { EvidenceFile, RegistrationFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";
import type { Address } from "viem";

/**
 * Follows registration evidence to the nested claim payload and returns the
 * profile photo when it can be fetched. Returns null when any hop is missing
 * or fails, preserving the caller's identicon fallback.
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
 * Resolves which evidence submitters are registered PoH humans and maps them to
 * their PoH ID. Only verified submitters are included, so callers can link
 * verified addresses to their profile page and fall back to the block explorer
 * for everyone else. Keyed by lowercased address.
 */
export const getEvidenceSubmitterProfiles = async (
  submitters: string[],
): Promise<Record<string, string>> => {
  const unique = Array.from(
    new Set(submitters.map((submitter) => submitter.toLowerCase())),
  );

  const entries = await Promise.all(
    unique.map(async (address) => {
      try {
        const raw = await getClaimerData(address as Address);
        const registeredChain = supportedChains.find(
          (chain) => raw[chain.id]?.claimer?.registration?.humanity?.id,
        );
        const pohId = registeredChain
          ? (raw[registeredChain.id].claimer?.registration?.humanity?.id ??
            null)
          : null;
        return [address, pohId] as const;
      } catch {
        return [address, null] as const;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is [string, string] => entry[1] !== null),
  );
};
