"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import SignInButton from "components/SignInButton";
import { useQuery } from "@tanstack/react-query";
import {
  fetchReferralPage,
  fetchReferrerSummary,
  REFERRALS_PAGE_SIZE,
} from "data/referral";
import ReferralIcon from "icons/Referral.svg";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ReferralCard from "./ReferralCard";

const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="paper p-5 md:p-7">
    <div className="text-orange mb-4 flex items-center gap-2">
      <ReferralIcon className="h-8 w-auto" />
      <h2 className="text-xl font-semibold">Referral</h2>
    </div>

    <h3 className="text-primaryText font-semibold">Invite Humans</h3>
    <p className="text-secondaryText mt-1 max-w-3xl text-sm">
      Earn 250 PNK when someone you invite becomes verified on PoH. Completing 5
      successful verified referrals, you get the exclusive Human Connector
      badge.
    </p>

    {children}
  </div>
);

const ReferralDashboard = () => {
  const { address } = useAccount();
  const { isVerified: isSignedIn } = useAtlasProvider();
  const account = address?.toLowerCase() as `0x${string}` | undefined;
  const [currentPage, setCurrentPage] = useState(0);

  const canFetch = Boolean(account && isSignedIn);

  const referrer = useQuery({
    queryKey: ["referral-referrer", account],
    queryFn: () => fetchReferrerSummary(account!),
    enabled: canFetch,
  });

  const referralPage = useQuery({
    queryKey: ["referral-page", account, currentPage],
    queryFn: () => fetchReferralPage(currentPage),
    enabled: canFetch && Boolean(referrer.data),
    // Keep the previous page rendered during a page switch, but never carry
    // another wallet's data across an account change.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === account ? previousData : undefined,
  });

  const totalCount = referralPage.data?.totalCount;
  const pageCount =
    totalCount === undefined ? 0 : Math.ceil(totalCount / REFERRALS_PAGE_SIZE);

  // The list can shrink under us (e.g. refetch after data changes); snap back
  // to the last page that still exists.
  useEffect(() => {
    if (pageCount > 0 && currentPage > pageCount - 1)
      setCurrentPage(pageCount - 1);
  }, [currentPage, pageCount]);

  // No hooks below — the early returns inside this closure are safe.
  const body = (() => {
    if (!canFetch)
      return (
        <CardShell>
          <div className="mt-5 flex flex-col items-start gap-3">
            <p className="text-secondaryText text-sm">
              {address
                ? "Sign in to get your referral link and track your rewards."
                : "Connect your wallet and sign in to get your referral link."}
            </p>
            <SignInButton />
          </div>
        </CardShell>
      );

    if (referrer.error || referralPage.error)
      return (
        <CardShell>
          <div className="mt-5 flex flex-col items-start gap-3">
            <p className="text-secondaryText text-sm">
              Could not load your referral data.
            </p>
            <button
              type="button"
              className="btn-secondary px-6 py-2"
              onClick={() => {
                if (referrer.error) void referrer.refetch();
                if (referralPage.error) void referralPage.refetch();
              }}
            >
              Retry
            </button>
          </div>
        </CardShell>
      );

    if (referrer.data === null)
      return (
        <CardShell>
          <p className="text-secondaryText mt-5 text-sm">
            Only verified humans can invite others. Claim your humanity to get
            your referral link.
          </p>
        </CardShell>
      );

    // Covers both queries' loading states; `referrer.data === null` (no
    // humanity) already returned above, so past here both are loaded.
    if (!referrer.data || !referralPage.data)
      return (
        <CardShell>
          <div className="mt-5 flex animate-pulse flex-col">
            <div className="flex items-center gap-2">
              <div className="bg-grey h-6 w-6 shrink-0 rounded-full" />
              <div className="bg-grey h-4 w-64 max-w-full rounded-full" />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-grey h-11 w-40 rounded-full" />
              <div className="bg-grey h-8 w-32 rounded-full" />
            </div>
            {/* Stats bar */}
            <div className="bg-grey mt-5 h-12 w-full rounded-2xl" />
            {/* Referred rows: avatar + name, stepper line, right-side status */}
            <div className="mt-6 flex flex-col">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className="flex flex-col gap-3 border-b border-white/10 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-grey h-6 w-6 shrink-0 rounded-full" />
                      <div className="bg-grey h-4 w-32 rounded-full" />
                    </div>
                    <div className="bg-grey h-5 w-64 max-w-full rounded-full" />
                  </div>
                  <div className="bg-grey h-4 w-28 shrink-0 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </CardShell>
      );

    return (
      <CardShell>
        <ReferralCard
          referrer={referrer.data}
          referralPage={referralPage.data}
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          isPageLoading={referralPage.isPlaceholderData}
        />
      </CardShell>
    );
  })();

  return body;
};

export default ReferralDashboard;
