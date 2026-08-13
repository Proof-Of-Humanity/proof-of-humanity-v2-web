import {
  getStoredReferral,
  REFERRAL_STORAGE_EVENT,
  type StoredReferral,
} from "data/referralAttribution";
import { useEffect, useState } from "react";

export const useStoredReferral = (refereeHumanityId?: `0x${string}` | null) => {
  const [referral, setReferral] = useState<StoredReferral | null>(null);

  useEffect(() => {
    const sync = () => setReferral(getStoredReferral(refereeHumanityId));
    sync();
    window.addEventListener(REFERRAL_STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(REFERRAL_STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [refereeHumanityId]);

  return referral;
};
