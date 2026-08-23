"use client";

/* eslint-disable */
// TEMPORARY DEV HARNESS — not part of the product. Renders the referral
// dashboard presentational components with mock props so every state can be
// inspected without a wallet or Atlas backend. Delete before merging.

import React from "react";
import {
  PohReferralPayoutTransactionStatus as Payout,
  PohReferralReviewStatus as Review,
} from "generated/atlas";
import {
  ReferralPage,
  ReferralStep,
  ReferredUser,
  ReferrerSummary,
} from "types/referral";
import { REFERRAL_STEPS } from "data/referralPresentation";
import ReferralCard from "components/Integrations/Referral/ReferralCard";
import ReferralSteps from "components/Integrations/Referral/ReferralSteps";
import ReferralStatsBar from "components/Integrations/Referral/ReferralStatsBar";
import ReferredList from "components/Integrations/Referral/ReferredList";
import ReferredUserRow from "components/Integrations/Referral/ReferredUserRow";
import ReferralLinkRow from "components/Integrations/Referral/ReferralLinkRow";
import ShareButtons from "components/Integrations/Referral/ShareButtons";
import PageNumbers from "components/Integrations/Referral/PageNumbers";
// ShareModal was dead code and is being deleted in the cleanup pass — not imported here.
import CopyButton from "components/Integrations/Referral/CopyButton";
import ReferralDashboard from "components/Integrations/Referral/ReferralDashboard";

// ---------------------------------------------------------------- boundary

class Boundary extends React.Component<
  { children: React.ReactNode; id: string },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error)
      return (
        <div
          data-testid={`boundary-${this.props.id}`}
          className="rounded-card border border-red-500 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <strong>RENDER THREW:</strong> {this.state.error.message}
        </div>
      );
    return this.props.children as React.ReactElement;
  }
}

/**
 * The in-app Browser pane only composits the first viewport while it is hidden,
 * so anything below the fold screenshots as a blank rectangle. `?only=<id>`
 * renders a single section at scroll 0 so it can be captured.
 */
const OnlyContext = React.createContext<string | null>(null);

const Section: React.FC<{
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}> = ({ id, title, note, children }) => {
  const only = React.useContext(OnlyContext);
  if (only && only !== id) return null;
  return (
    <section id={id} className="mb-14 scroll-mt-8">
      <h2 className="text-primaryText mb-1 border-b border-white/20 pb-2 text-lg font-bold">
        {title}
      </h2>
      {note && <p className="text-secondaryText mb-3 text-xs">{note}</p>}
      <Boundary id={id}>{children}</Boundary>
    </section>
  );
};

// ------------------------------------------------------------------ mocks

const addr = (n: number) =>
  `0x${n.toString(16).padStart(2, "0").repeat(20)}`.slice(
    0,
    42,
  ) as `0x${string}`;

const TX = "0x9a1f0c7b2d4e6a8c0b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e";

const SEPOLIA = 11155111;
const CHIADO = 10200;

const base: Omit<ReferredUser, "refereeHumanityId"> = {
  reviewStatus: Review.Active,
  payoutStatus: Payout.NotSent,
  verification: "not-registered",
  refereeFlagged: false,
  rewardAmount: 250,
  photo: null,
  payoutTxHash: null,
};

const rows: ReferredUser[] = [
  // 1. not-registered / ACTIVE / NOT_SENT  -> "Not Registered Yet", step "started"
  { ...base, refereeHumanityId: addr(0x11), name: "Alice Rivera" },
  // 2. needs-vouch -> "Needs Vouch", step "in-progress"
  {
    ...base,
    refereeHumanityId: addr(0x22),
    verification: "needs-vouch",
    chainId: SEPOLIA,
  },
  // 3. in-review -> "In Review", step "in-progress"
  {
    ...base,
    refereeHumanityId: addr(0x33),
    name: "Chen Wu",
    verification: "in-review",
    chainId: CHIADO,
  },
  // 4. verified / payout NOT_SENT -> "Verified Human", step "reward-pending"
  {
    ...base,
    refereeHumanityId: addr(0x44),
    name: "Dara Okoye",
    verification: "verified",
    chainId: SEPOLIA,
  },
  // 5. verified / payout PENDING + txHash -> "Payout pending · View transaction"
  {
    ...base,
    refereeHumanityId: addr(0x55),
    name: "Eli Novak",
    verification: "verified",
    payoutStatus: Payout.Pending,
    payoutTxHash: TX,
    chainId: CHIADO,
  },
  // 6. verified / payout CONFIRMED + txHash -> "Reward paid", step "paid"
  {
    ...base,
    refereeHumanityId: addr(0x66),
    name: "Farrah Idris",
    verification: "verified",
    payoutStatus: Payout.Confirmed,
    payoutTxHash: TX,
    chainId: SEPOLIA,
  },
  // 7. verification rejected -> "Claim Rejected" + description, halted
  {
    ...base,
    refereeHumanityId: addr(0x77),
    name: "Gus Halvorsen",
    verification: "rejected",
  },
  // 8. revocation-pending -> "Revocation Pending" + description, halted
  {
    ...base,
    refereeHumanityId: addr(0x88),
    name: "Hana Brenner",
    verification: "revocation-pending",
    chainId: SEPOLIA,
  },
  // 8a. revocation-pending AFTER the payout broadcast -> "payout in flight
  // is unaffected" description, NOT halted (a broadcast tx can't be stopped)
  {
    ...base,
    refereeHumanityId: addr(0x8a),
    name: "Hakim Diallo",
    verification: "revocation-pending",
    payoutStatus: Payout.Pending,
    payoutTxHash: TX,
    chainId: SEPOLIA,
  },
  // 8b. removed, unpaid -> "Removed from Registry" + description, halted
  {
    ...base,
    refereeHumanityId: addr(0x8b),
    name: "Hugo Lindqvist",
    verification: "removed",
    chainId: SEPOLIA,
  },
  // 8c. removed AFTER a confirmed payout -> badge shows removal, step stays "paid"
  {
    ...base,
    refereeHumanityId: addr(0x8c),
    name: "Ida Castellanos",
    verification: "removed",
    payoutStatus: Payout.Confirmed,
    payoutTxHash: TX,
    chainId: CHIADO,
  },
  // 8d. expired (paid long ago) -> "Registration Expired", step "paid", not halted
  {
    ...base,
    refereeHumanityId: addr(0x8d),
    name: "Imre Farkas",
    verification: "expired",
    payoutStatus: Payout.Confirmed,
    payoutTxHash: TX,
    chainId: SEPOLIA,
  },
  // 8e. expired, unpaid -> frozen at "verified", not halted
  {
    ...base,
    refereeHumanityId: addr(0x8e),
    name: "Ines Barbosa",
    verification: "expired",
    chainId: CHIADO,
  },
  // 9. reviewStatus NEEDS_REVIEW -> "Needs Review", halted
  {
    ...base,
    refereeHumanityId: addr(0x99),
    name: "Iris Kovacs",
    verification: "verified",
    reviewStatus: Review.NeedsReview,
  },
  // 9b. reviewStatus APPROVED -> same as active (reward pending if verified)
  {
    ...base,
    refereeHumanityId: addr(0x9a),
    name: "Ivo Petrov",
    verification: "verified",
    reviewStatus: Review.Approved,
  },
  // 10. reviewStatus REJECTED -> "Referral Rejected", halted
  {
    ...base,
    refereeHumanityId: addr(0xaa),
    name: "Jonas Meier",
    verification: "verified",
    reviewStatus: Review.Rejected,
  },
  // 11. refereeFlagged -> "Referee Flagged", halted (wins over everything)
  {
    ...base,
    refereeHumanityId: addr(0xbb),
    name: "Kira Solberg",
    verification: "verified",
    refereeFlagged: true,
  },
  // 11b. flagged AFTER payout broadcast — badge must not claim the in-flight
  // payout is paused; stepper stays at Reward Pending (not halted).
  {
    ...base,
    refereeHumanityId: addr(0xb2),
    name: "Noor Haddad",
    verification: "verified",
    refereeFlagged: true,
    payoutStatus: Payout.Pending,
  },
  // 12. long name, no chain, confirmed payout — overflow probe
  {
    ...base,
    refereeHumanityId: addr(0xcc),
    name: "Maximilian-Alexander Von Hohenzollern-Sigmaringen",
    verification: "verified",
    payoutStatus: Payout.Confirmed,
    payoutTxHash: TX,
  },
];

const LINK = "https://app.proofofhumanity.id/?ref=0xbadc0ffee0ddf00dfeed";

const referrer = (over: Partial<ReferrerSummary> = {}): ReferrerSummary => ({
  humanityId: addr(0xf0),
  photo: null,
  referralLink: LINK,
  pendingRevocation: false,
  ...over,
});

const pageData = (over: Partial<ReferralPage> = {}): ReferralPage => ({
  humanityFlagged: false,
  stats: { verifiedReferrals: 3, paidRewards: 750, pendingRewards: 1500 },
  totalCount: rows.length,
  referred: rows,
  ...over,
});

const PAGE_SIZE = 10;

/** ReferralCard with client-side paging over the mock rows (server paging in prod). */
const PagedCardDemo: React.FC<{
  referrerOverrides?: Partial<ReferrerSummary>;
  pageOverrides?: Partial<ReferralPage>;
}> = ({ referrerOverrides, pageOverrides }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  // `?page=N` opens the demo on a later page (headless screenshot capture).
  React.useEffect(() => {
    const initial = Number(
      new URLSearchParams(window.location.search).get("page"),
    );
    if (Number.isInteger(initial) && initial > 0) setCurrentPage(initial);
  }, []);
  const merged = pageData(pageOverrides);
  const pageRows = merged.referred.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  return (
    <Shell>
      <ReferralCard
        referrer={referrer(referrerOverrides)}
        referralPage={{
          ...merged,
          totalCount: merged.referred.length,
          referred: pageRows,
        }}
        currentPage={currentPage}
        pageCount={Math.ceil(merged.referred.length / PAGE_SIZE)}
        onPageChange={setCurrentPage}
      />
    </Shell>
  );
};

/** Isolated PageNumbers with its own state so every layout can be clicked through. */
const PageNumbersDemo: React.FC<{ pageCount: number; initial?: number }> = ({
  pageCount,
  initial = 0,
}) => {
  const [currentPage, setCurrentPage] = React.useState(initial);
  return (
    <PageNumbers
      currentPage={currentPage}
      pageCount={pageCount}
      onPageChange={setCurrentPage}
    />
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="paper p-5 md:p-7">{children}</div>
);

// ------------------------------------------------------------------- page

const SECTION_IDS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
  "s13",
  "s14",
  "s15",
];

export default function DevReferralPage() {
  const [only, setOnly] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOnly(new URLSearchParams(window.location.search).get("only"));
  }, []);

  return (
    <OnlyContext.Provider value={only}>
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-primaryText mb-2 text-2xl font-bold">
          DEV: Referral dashboard state matrix
        </h1>
        <p className="text-secondaryText mb-6 flex flex-wrap gap-2 text-xs">
          <span>Isolate a section (screenshots at scroll 0):</span>
          <a href="/dev-referral" className="text-orange underline">
            all
          </a>
          {SECTION_IDS.map((id) => (
            <a
              key={id}
              href={`/dev-referral?only=${id}`}
              className="text-orange underline"
            >
              {id}
            </a>
          ))}
        </p>

        <Section
          id="s1"
          title="1. ReferralCard — fully populated (12 referees, paged 10 + 2)"
          note="stats: 3 verified / 750 PNK paid / 1500 PNK pending; page numbers bottom right"
        >
          <PagedCardDemo />
        </Section>

        <Section
          id="s2"
          title="2. ReferralCard — empty state (0 referrals)"
          note="ReferredList and page numbers should be omitted entirely"
        >
          <PagedCardDemo
            pageOverrides={{
              referred: [],
              stats: {
                verifiedReferrals: 0,
                paidRewards: 0,
                pendingRewards: 0,
              },
            }}
          />
        </Section>

        <Section
          id="s3"
          title="3. ReferralCard — referrer humanityFlagged (Rewards on hold)"
          note="expects the warning panel + 'On hold' tag in the stats bar; 3 rows = single page, no page numbers"
        >
          <Shell>
            <PagedCardDemo
              pageOverrides={{
                humanityFlagged: true,
                referred: rows.slice(0, 3),
              }}
            />
          </Shell>
        </Section>

        <Section
          id="s4"
          title="4. ReferralCard — referrer pendingRevocation (challenged warning)"
          note="only shows when humanityFlagged is false"
        >
          <PagedCardDemo
            referrerOverrides={{ pendingRevocation: true }}
            pageOverrides={{ referred: rows.slice(0, 2) }}
          />
        </Section>

        <Section
          id="s5"
          title="5. ReferralCard — flagged AND pendingRevocation (only one panel expected)"
        >
          <PagedCardDemo
            referrerOverrides={{ pendingRevocation: true }}
            pageOverrides={{ humanityFlagged: true, referred: [] }}
          />
        </Section>

        <Section
          id="s15"
          title="15. PageNumbers — isolated (4 pages, 12 pages with ellipsis, mid-range)"
          note="clickable; active page is the peach pill, chevrons disable at the ends"
        >
          <Shell>
            <div className="flex flex-col gap-2">
              <PageNumbersDemo pageCount={4} />
              <PageNumbersDemo pageCount={12} />
              <PageNumbersDemo pageCount={12} initial={5} />
            </div>
          </Shell>
        </Section>

        <Section
          id="s7"
          title="7. ReferralStatsBar — isolated, plain + rewardsOnHold"
        >
          <div className="flex flex-col gap-4">
            <ReferralStatsBar
              stats={{
                verifiedReferrals: 12,
                paidRewards: 3000,
                pendingRewards: 1250,
              }}
            />
            <ReferralStatsBar
              stats={{
                verifiedReferrals: 0,
                paidRewards: 0,
                pendingRewards: 0,
              }}
              rewardsOnHold
            />
            <ReferralStatsBar
              stats={{
                verifiedReferrals: 1234,
                paidRewards: 1234567,
                pendingRewards: 987654,
              }}
              rewardsOnHold
            />
          </div>
        </Section>

        <Section
          id="s8"
          title="8. ReferralSteps — every funnel position (normal, then halted)"
          note="5-step funnel: Started > In Progress > Verified > Reward Pending > Paid. Only one step is active at a time; 'halted' dims the whole track."
        >
          <div className="flex flex-col gap-3">
            {REFERRAL_STEPS.map((s: ReferralStep) => (
              <div key={s} className="flex items-center gap-4">
                <span className="text-secondaryText w-32 shrink-0 text-xs">
                  {s}
                </span>
                <ReferralSteps active={s} />
              </div>
            ))}
            <div className="mt-3 border-t border-white/10 pt-3" />
            {REFERRAL_STEPS.map((s: ReferralStep) => (
              <div key={`h-${s}`} className="flex items-center gap-4">
                <span className="text-secondaryText w-32 shrink-0 text-xs">
                  {s} (halted)
                </span>
                <ReferralSteps active={s} halted />
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="s9"
          title="9. ReferredUserRow — one row per distinct status, isolated"
        >
          <Shell>
            <ReferredList users={rows} />
          </Shell>
        </Section>

        <Section
          id="s10"
          title="10. ReferralLinkRow — identicon, long link, no avatar"
        >
          <Shell>
            <div className="flex flex-col gap-4">
              <ReferralLinkRow
                link={LINK}
                avatarAddress={addr(0xf0)}
                photo={null}
              />
              <ReferralLinkRow
                link={`https://app.proofofhumanity.id/?ref=${addr(0xf0)}`}
                avatarAddress={addr(0xf0)}
                photo={null}
              />
              <ReferralLinkRow
                link="https://app.proofofhumanity.id/"
                avatarAddress={addr(0xf0)}
                photo={null}
              />
            </div>
          </Shell>
        </Section>

        <Section id="s11" title="11. CopyButton + ShareButtons — isolated">
          <Shell>
            <div className="flex flex-wrap items-center gap-6">
              <CopyButton value={LINK} />
              <CopyButton value={LINK} />
              <CopyButton value={LINK} variant="icon" />
              <ShareButtons link={LINK} message="Join Proof of Humanity:" />
            </div>
          </Shell>
        </Section>

        <Section
          id="s12"
          title="12. ReferralDashboard — real component (signed-out gate)"
          note="uses the real wagmi/atlas hooks; expected to show the sign-in shell"
        >
          <ReferralDashboard />
        </Section>

        <Section
          id="s14"
          title="14. PROBE: payoutStatus NOT_SENT but payoutTxHash already set"
          note="the atlas enum says NOT_SENT means the hash was precomputed but never broadcast — does the row still offer a 'View transaction' link?"
        >
          <Shell>
            <ReferredUserRow
              user={{
                ...base,
                refereeHumanityId: addr(0xed),
                name: "Precomputed Hash",
                verification: "verified",
                payoutStatus: Payout.NotSent,
                payoutTxHash: TX,
              }}
            />
          </Shell>
        </Section>

        <Section
          id="s13"
          title="13. PROBE: ReferredUserRow with an unsupported chainId (137 = Polygon)"
          note="ChainLogo throws for chain ids outside mainnet/sepolia/gnosis/chiado — this section is wrapped in an error boundary on purpose"
        >
          <Shell>
            <ReferredUserRow
              user={{
                ...base,
                refereeHumanityId: addr(0xde),
                name: "Polygon Pete",
                verification: "verified",
                chainId: 137,
              }}
            />
          </Shell>
        </Section>
      </div>
    </OnlyContext.Provider>
  );
}
