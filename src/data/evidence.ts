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

export interface EvidenceSubmitterProfile {
  pohId: string;
  name?: string;
  photo?: string;
}

/**
 * Resolves which evidence submitters are registered PoH humans and maps them
 * to their profile (PoH ID, display name and registration photo). Only
 * verified submitters are included, so callers can render the profile
 * photo/name and link to the profile page, falling back to identicon +
 * address + block explorer for everyone else. Keyed by lowercased address.
 */
export const getEvidenceSubmitterProfiles = async (
  submitters: string[],
): Promise<Record<string, EvidenceSubmitterProfile>> => {
  const unique = Array.from(
    new Set(submitters.map((submitter) => submitter.toLowerCase())),
  );

  const entries = await Promise.all(
    unique.map(
      async (address): Promise<[string, EvidenceSubmitterProfile | null]> => {
        try {
          const raw = await getClaimerData(address as Address);
          const registeredChain = supportedChains.find(
            (chain) => raw[chain.id]?.claimer?.registration?.humanity?.id,
          );
          if (!registeredChain) return [address, null];

          const claimer = raw[registeredChain.id].claimer;
          const pohId = claimer?.registration?.humanity?.id ?? null;
          if (!pohId) return [address, null];

          // Same hop as the vouch avatars: winning claim evidence points at
          // the registration file, which holds the profile photo.
          const evidenceUri = claimer?.registration?.humanity.winnerClaim
            .at(0)
            ?.evidenceGroup.evidence.at(0)?.uri;
          const photo = (await getRegistrationPhoto(evidenceUri)) ?? undefined;

          return [address, { pohId, name: claimer?.name ?? undefined, photo }];
        } catch {
          return [address, null];
        }
      },
    ),
  );

  return Object.fromEntries(
    entries.filter(
      (entry): entry is [string, EvidenceSubmitterProfile] => entry[1] !== null,
    ),
  );
};
