import type { EvidenceFile, RegistrationFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";

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
