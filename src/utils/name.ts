import { RegistrationFile } from "types/docs";

export const getDisplayName = (
  data: RegistrationFile | undefined,
  claimerName?: string | null,
) => {
  if (data?.name && claimerName && data.name !== claimerName) {
    return `${data.name} (aka ${claimerName})`;
  }

  return claimerName || data?.name || "";
};
