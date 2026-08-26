import useIPFS from "hooks/useIPFS";
import type { EvidenceFile, RegistrationFile } from "types/docs";
import { safeIpfsUrl } from "utils/ipfs";

const useProfilePhoto = (evidenceUri?: string) => {
  const [evidence] = useIPFS<EvidenceFile>(evidenceUri);
  const [registration] = useIPFS<RegistrationFile>(evidence?.fileURI);
  return safeIpfsUrl(registration?.photo) ?? null;
};

export default useProfilePhoto;
