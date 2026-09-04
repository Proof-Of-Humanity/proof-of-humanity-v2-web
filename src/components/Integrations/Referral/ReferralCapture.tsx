"use client";

import { useAppKit } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import Modal from "components/Modal";
import {
  parseReferralHumanityId,
  PENDING_KEY,
  persistReferral,
  pinPendingReferral,
  refereeHasClaimRequest,
  resolveReferralReferrer,
} from "data/referralAttribution";
import { useStoredReferral } from "hooks/useStoredReferral";
import ReferralIcon from "icons/Referral.svg";
import WarningIcon from "icons/WarningCircleMajor.svg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { prettifyId } from "utils/identifier";
import { useAccount } from "wagmi";
import ReferralAvatar from "./ReferralAvatar";

const MODAL_CLASS = "max-w-md p-6 text-center sm:p-8";

const ISSUE_COPY = {
  invalid: {
    title: "Invalid Link!",
    description: "Oops, seems like you followed an invalid referral link.",
  },
  expired: {
    title: "The inviter has expired.",
    description: "This referral can no longer be used.",
  },
  unavailable: {
    title: "Couldn't verify link",
    description:
      "We couldn't check this referral right now. Please try again later.",
  },
} as const;

const ReferralCapture = () => {
  const modal = useAppKit();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [claimLoading, setClaimLoading] = useState(false);

  const rawRef = searchParams.get("ref");
  const referrerHumanityId = rawRef ? parseReferralHumanityId(rawRef) : null;
  // can be undefined if the user is not connected
  const refereeHumanityId = address
    ? (address.toLowerCase() as `0x${string}`)
    : undefined;
  const storedReferral = useStoredReferral(refereeHumanityId);

  const {
    data: resolvedReferral,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["referralReferrer", referrerHumanityId],
    queryFn: () => resolveReferralReferrer(referrerHumanityId!),
    enabled: !!referrerHumanityId,
    retry: false,
  });
  const { data: hasPriorClaim, isFetched: refereeChecked } = useQuery({
    queryKey: ["referralRefereePriorClaim", refereeHumanityId],
    queryFn: () => refereeHasClaimRequest(refereeHumanityId!),
    enabled: !!refereeHumanityId,
    retry: false,
  });

  let issue: keyof typeof ISSUE_COPY | null = null;
  if (rawRef) {
    if (!referrerHumanityId) issue = "invalid";
    else if (isError) issue = "unavailable";
    else if (isSuccess && !resolvedReferral) issue = "expired";
  }
  const issueCopy = issue ? ISSUE_COPY[issue] : null;

  const showSuccess =
    !!rawRef &&
    !!resolvedReferral &&
    storedReferral?.referrerHumanityId ===
      resolvedReferral.referrerHumanityId &&
    !hasPriorClaim;

  const clearRefParam = useCallback(() => {
    if (!searchParams.has("ref")) return;
    const params = new URLSearchParams(searchParams);
    params.delete("ref");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (hasPriorClaim) {
      clearRefParam();
      return;
    }
    if (refereeHumanityId && !refereeChecked) return;
    if (rawRef && resolvedReferral)
      // a pending referral is stored in session storage
      // will be converted to a pinned referral when the user connects their wallet
      persistReferral("session", PENDING_KEY, resolvedReferral);
    if (refereeHumanityId) pinPendingReferral(refereeHumanityId);
  }, [
    rawRef,
    resolvedReferral,
    refereeHumanityId,
    refereeChecked,
    hasPriorClaim,
    clearRefParam,
  ]);

  const connectWalletOrStartClaim = () => {
    if (!address) {
      modal.open({ view: "Connect" });
      return;
    }
    setClaimLoading(true);
    router.push(`/${prettifyId(address)}/claim`);
  };

  return (
    <>
      <Modal open={!!issue} onClose={clearRefParam} className={MODAL_CLASS}>
        {issueCopy && (
          <>
            <span className="text-status-rejected mb-4 inline-flex">
              <WarningIcon className="h-14 w-14" />
            </span>
            <h2 className="text-primaryText text-2xl font-semibold">
              {issueCopy.title}
            </h2>
            <p className="text-secondaryText mt-2">{issueCopy.description}</p>
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={clearRefParam}
            >
              Continue
            </button>
          </>
        )}
      </Modal>

      <Modal
        open={showSuccess}
        onClose={() => {
          setClaimLoading(false);
          clearRefParam();
        }}
        className={MODAL_CLASS}
      >
        <div className="text-orange bg-orange/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <ReferralIcon className="h-7 w-auto" />
        </div>

        <h2 className="text-primaryText text-2xl font-semibold">
          You&apos;ve been invited
        </h2>

        {storedReferral && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <ReferralAvatar
              address={storedReferral.referrerHumanityId}
              evidenceUri={storedReferral.evidenceUri}
              alt={storedReferral.name}
              diameter={64}
              className="h-16 w-16 rounded-full object-cover"
            />
            <p className="text-primaryText text-lg">
              You&apos;ve been invited by{" "}
              <span className="font-semibold">{storedReferral.name}</span>.
            </p>
          </div>
        )}

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={connectWalletOrStartClaim}
          disabled={claimLoading}
        >
          {claimLoading
            ? "Opening claim..."
            : address
              ? "Claim Humanity"
              : "Connect wallet & Claim"}
        </button>
      </Modal>
    </>
  );
};

export default ReferralCapture;
