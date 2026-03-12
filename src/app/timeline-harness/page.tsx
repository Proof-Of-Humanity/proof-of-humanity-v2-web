import Timeline from "app/[pohid]/[chain]/[request]/Timeline";
import { TimelineItem } from "data/requestTimeline";

const complexClaimTimeline: TimelineItem[] = [
  {
    id: "claim-received-b2",
    kind: "received",
    title: "Received on Gnosis",
    timestamp: 1774652400, // March 27, 2026
    chainId: 100,
  },
  {
    id: "claim-transfer-a2b2",
    kind: "transferred",
    title: "Transferred profile from Ethereum to Gnosis",
    timestamp: 1774648800, // March 27, 2026
    chainId: 1,
  },
  {
    id: "claim-received-a2",
    kind: "received",
    title: "Received on Ethereum",
    timestamp: 1773612000, // March 15, 2026
    chainId: 1,
  },
  {
    id: "claim-transfer-b2a2",
    kind: "transferred",
    title: "Transferred profile from Gnosis to Ethereum",
    timestamp: 1773608400, // March 15, 2026
    chainId: 100,
  },
  {
    id: "claim-received-b1",
    kind: "received",
    title: "Received on Gnosis",
    timestamp: 1772380800, // March 01, 2026
    chainId: 100,
  },
  {
    id: "claim-transfer-a2b1",
    kind: "transferred",
    title: "Transferred profile from Ethereum to Gnosis",
    timestamp: 1772377200, // March 01, 2026
    chainId: 1,
  },
  {
    id: "claim-verified",
    kind: "verified",
    title: "Verified human",
    timestamp: 1771722000, // February 22, 2026
    chainId: 1,
  },
  {
    id: "claim-appeal-2",
    kind: "appeal",
    title: "Appeal round 2",
    timestamp: 1771286400, // February 17, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/8421",
  },
  {
    id: "claim-appeal-1",
    kind: "appeal",
    title: "Appeal round 1",
    timestamp: 1771113600, // February 15, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/8421",
  },
  {
    id: "claim-challenged",
    kind: "challenged",
    title: "Challenged",
    timestamp: 1771027200, // February 14, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/8421",
  },
  {
    id: "claim-in-review",
    kind: "inReview",
    title: "In review",
    timestamp: 1770940800, // February 13, 2026
    chainId: 1,
  },
  {
    id: "claim-submitted",
    kind: "submitted",
    title: "Profile submitted",
    timestamp: 1770854400, // February 12, 2026
    chainId: 1,
  },
];

const complexRevocationTimeline: TimelineItem[] = [
  {
    id: "revoke-received-b3",
    kind: "received",
    title: "Received on Gnosis",
    timestamp: 1780524000, // June 03, 2026
    chainId: 100,
  },
  {
    id: "revoke-transfer-a2b3",
    kind: "transferred",
    title: "Transferred profile from Ethereum to Gnosis",
    timestamp: 1780520400, // June 03, 2026
    chainId: 1,
  },
  {
    id: "revoke-removed",
    kind: "removed",
    title: "Removed",
    timestamp: 1780092000, // May 29, 2026
    chainId: 1,
  },
  {
    id: "revoke-appeal-2",
    kind: "appeal",
    title: "Appeal round 2",
    timestamp: 1779832800, // May 26, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/9197",
  },
  {
    id: "revoke-appeal-1",
    kind: "appeal",
    title: "Appeal round 1",
    timestamp: 1779656400, // May 24, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/9197",
  },
  {
    id: "revoke-challenged",
    kind: "challenged",
    title: "Challenged",
    timestamp: 1779573600, // May 23, 2026
    chainId: 1,
    externalHref: "https://klerosboard.com/1/cases/9197",
  },
  {
    id: "revoke-in-review",
    kind: "inReview",
    title: "In review",
    timestamp: 1779400800, // May 21, 2026
    chainId: 1,
  },
  {
    id: "revoke-submitted",
    kind: "submitted",
    title: "Removal requested",
    timestamp: 1779400800, // May 21, 2026
    chainId: 1,
  },
];

const sections = [
  {
    id: "claim",
    items: complexClaimTimeline,
  },
  {
    id: "revocation",
    items: complexRevocationTimeline,
  },
];

export default function TimelineHarnessPage() {
  return (
    <div className="content-wide">
      <div className="paper px-6 py-8 md:px-10">
        <h1 className="text-primaryText text-3xl font-semibold">
          Timeline Harness
        </h1>
      </div>

      {sections.map((section, index) => (
        <section key={section.id} className="paper px-6 py-8 md:px-10">
          <div className="max-w-3xl">
          </div>

          {index === 0 && <div className="" />}

          <Timeline items={section.items} />
        </section>
      ))}
    </div>
  );
}
