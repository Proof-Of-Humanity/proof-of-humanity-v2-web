"use client";

import { useAppKit } from "@reown/appkit/react";
import Identicon from "components/Identicon";
import Modal from "components/Modal";
import {
  getStoredReferral,
  parseReferralHumanityId,
  resolveReferralReferrer,
  storeReferralFirstTouch,
} from "data/referralAttribution";
import type { StoredReferral } from "data/referralAttribution";
import ReferralIcon from "icons/Referral.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { prettifyId } from "utils/identifier";
import { safeIpfsUrl } from "utils/ipfs";

const ReferralCapture = () => {
  const modal = useAppKit();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const capturedRef = useRef<string | null>(null);
  const [referral, setReferral] = useState<StoredReferral | null>(null);
  const [open, setOpen] = useState(false);
  const photoUrl = safeIpfsUrl(referral?.photo);
  const canClaim = isConnected && address;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawRef = params.get("ref");

    // Preserve first-touch attribution even if the user lands on a later link.
    if (!rawRef || capturedRef.current === rawRef || getStoredReferral()) {
      return;
    }

    capturedRef.current = rawRef;
    const referrerHumanityId = parseReferralHumanityId(rawRef);
    if (!referrerHumanityId) return;

    resolveReferralReferrer(referrerHumanityId)
      .then((resolvedReferral) => {
        if (!resolvedReferral) return;
        if (!storeReferralFirstTouch(resolvedReferral)) return;

        setReferral(resolvedReferral);
        setOpen(true);
      })
      .catch(() => undefined);
  }, []);

  const handleCta = () => {
    if (!canClaim) {
      modal.open({ view: "Connect" });
      return;
    }

    setOpen(false);
    router.push(`/${prettifyId(address)}/claim`);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      formal
      className="max-w-md p-6 text-center sm:p-8"
    >
      <div className="text-orange bg-orange/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <ReferralIcon className="h-7 w-auto" />
      </div>

      <h2 className="text-primaryText text-2xl font-semibold">
        You've been referred
      </h2>

      {referral && (
        <div className="mt-5 flex flex-col items-center gap-3">
          {photoUrl ? (
            <Image
              alt={referral.name}
              src={photoUrl}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <Identicon address={referral.referrerHumanityId} diameter={64} />
          )}
          <p className="text-primaryText text-lg">
            You've been referred by{" "}
            <span className="font-semibold">{referral.name}</span>.
          </p>
        </div>
      )}

      <button
        type="button"
        className="btn-primary mt-6 w-full"
        onClick={handleCta}
      >
        {canClaim ? "Claim" : "Connect wallet"}
      </button>
    </Modal>
  );
};

export default ReferralCapture;
