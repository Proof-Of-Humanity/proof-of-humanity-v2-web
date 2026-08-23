"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import cn from "classnames";
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
// dev harness start
import { mockReferralPage, mockReferrer } from "./referralMockData";
// dev harness end

// Static card shell shown in every state (header of Card-Referral).
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

// dev harness start
// Bootstrappable via URL: ?mockReferral=1&mockFlagged=1&mockRevocation=1&mockEmpty=1
interface MockState {
  on: boolean;
  flagged: boolean;
  revocation: boolean;
  empty: boolean;
}

const MockPill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs transition-colors",
      active
        ? "text-orange border-peach"
        : "text-secondaryText border-stroke hover:text-orange",
    )}
  >
    {label}
  </button>
);
// dev harness end

/**
 * Referral feature card on the Rewards page. Owns the auth gating, the page
 * state and data fetching; renders `ReferralCard` once the signed-in user's
 * referrer identity and the current page are loaded.
 */
const ReferralDashboard = () => {
  const { address } = useAccount();
  const { isVerified: isSignedIn } = useAtlasProvider();
  const account = address?.toLowerCase() as `0x${string}` | undefined;
  const [currentPage, setCurrentPage] = useState(0);

  // dev harness start
  const [mock, setMock] = useState<MockState>({
    on: false,
    flagged: false,
    revocation: false,
    empty: false,
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mockReferral") !== "1") return;
    setMock({
      on: true,
      flagged: params.get("mockFlagged") === "1",
      revocation: params.get("mockRevocation") === "1",
      empty: params.get("mockEmpty") === "1",
    });
    const initialPage = Number(params.get("mockPage"));
    if (Number.isInteger(initialPage) && initialPage > 0)
      setCurrentPage(initialPage);
  }, []);
  const toggleMockOption = (key: keyof MockState) => () => {
    setMock((current) => ({ ...current, [key]: !current[key] }));
    setCurrentPage(0);
  };
  // dev harness end

  const canFetch =
    Boolean(account && isSignedIn) &&
    // dev harness start
    !mock.on;
  // dev harness end

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

  // dev harness start
  const mockControls = (
    <div className="mb-2 flex flex-wrap items-center justify-end gap-1.5">
      <MockPill
        label="Mock data"
        active={mock.on}
        onClick={toggleMockOption("on")}
      />
      {mock.on && (
        <>
          <MockPill
            label="Flag referrer"
            active={mock.flagged}
            onClick={toggleMockOption("flagged")}
          />
          <MockPill
            label="Revocation pending"
            active={mock.revocation}
            onClick={toggleMockOption("revocation")}
          />
          <MockPill
            label="Empty"
            active={mock.empty}
            onClick={toggleMockOption("empty")}
          />
        </>
      )}
    </div>
  );

  const mockedPage = mock.on
    ? mockReferralPage({
        pageIndex: currentPage,
        pageSize: REFERRALS_PAGE_SIZE,
        humanityFlagged: mock.flagged,
        empty: mock.empty,
      })
    : undefined;
  // dev harness end

  const totalCount = // dev harness start
  (
    mockedPage ??
    // dev harness end
    referralPage.data
  )?.totalCount;
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
    // dev harness start
    if (mockedPage)
      return (
        <CardShell>
          <ReferralCard
            referrer={mockReferrer(mock.revocation)}
            referralPage={mockedPage}
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        </CardShell>
      );
    // dev harness end

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
            {/* Link row: avatar + "My Referral Link: …" */}
            <div className="flex items-center gap-2">
              <div className="bg-grey h-6 w-6 shrink-0 rounded-full" />
              <div className="bg-grey h-4 w-64 max-w-full rounded-full" />
            </div>
            {/* Copy + share actions */}
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

  return (
    <div>
      {/* dev harness start */}
      {mockControls}
      {/* dev harness end */}
      {body}
    </div>
  );
};

export default ReferralDashboard;
