import {
  getStoredReferral,
  REFERRAL_STORAGE_EVENT,
} from "data/referralAttribution";
import type { StoredReferral } from "data/referralAttribution";
import { useEffect, useState } from "react";

export const useStoredReferral = (refereeHumanityId?: `0x${string}` | null) => {
  const [referral, setReferral] = useState<StoredReferral | null>(null);

  useEffect(() => {
    const syncReferral = () =>
      setReferral(
        refereeHumanityId ? getStoredReferral(refereeHumanityId) : null,
      );

    syncReferral();
    window.addEventListener(REFERRAL_STORAGE_EVENT, syncReferral);
    window.addEventListener("storage", syncReferral);

    return () => {
      window.removeEventListener(REFERRAL_STORAGE_EVENT, syncReferral);
      window.removeEventListener("storage", syncReferral);
    };
  }, [refereeHumanityId]);

  return referral;
};
