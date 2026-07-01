import {
  getStoredReferral,
  REFERRAL_STORAGE_EVENT,
} from "data/referralAttribution";
import type { StoredReferral } from "data/referralAttribution";
import { useEffect, useState } from "react";

export const useStoredReferral = () => {
  const [referral, setReferral] = useState<StoredReferral | null>(null);

  useEffect(() => {
    const syncReferral = () => setReferral(getStoredReferral());

    syncReferral();
    window.addEventListener(REFERRAL_STORAGE_EVENT, syncReferral);
    window.addEventListener("storage", syncReferral);

    return () => {
      window.removeEventListener(REFERRAL_STORAGE_EVENT, syncReferral);
      window.removeEventListener("storage", syncReferral);
    };
  }, []);

  return referral;
};
