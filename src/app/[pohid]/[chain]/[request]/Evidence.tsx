"use client";

import Accordion from "components/Accordion";
import ActionButton from "components/ActionButton";
import AddEvidenceModal from "components/AddEvidenceModal";
import Attachment from "components/Attachment";
import ExternalLink from "components/ExternalLink";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import Identicon from "components/Identicon";
import TimeAgo from "components/TimeAgo";
import { explorerLink, idToChain } from "config/chains";
import type { EvidenceSubmitterProfile } from "data/evidence";
import useChainParam from "hooks/useChainParam";
import useIPFS from "hooks/useIPFS";
import Image from "next/image";
import Link from "next/link";
import type { OptimisticEvidenceItem } from "optimistic/types";
import { useRequestOptimistic } from "optimistic/request";
import { useEffect, useState } from "react";
import { EvidenceFile } from "types/docs";
import { shortenAddress } from "utils/address";
import { prettifyId } from "utils/identifier";
import { safeIpfsUrl } from "utils/ipfs";
import { resolveTxState } from "utils/txState";
import { Hash } from "viem";
import { useChainId } from "wagmi";

interface ItemInterface {
  number: number;
  item: OptimisticEvidenceItem;
  isPending?: boolean;
  profile?: EvidenceSubmitterProfile;
}

function Item({ number, item, isPending, profile }: ItemInterface) {
  const chain = useChainParam();
  const [evidence] = useIPFS<EvidenceFile>(item.uri);
  const ipfsUri = evidence?.fileURI
    ? evidence?.fileURI
    : evidence?.evidence
      ? evidence?.evidence
      : item.fileURI;
  const title = evidence?.name || item.name;
  const description = evidence?.description || item.description;

  if (!chain) return null;

  const shortAddress = shortenAddress(item.submitter);
  const photoUrl = safeIpfsUrl(profile?.photo);

  return (
    <div
      className={
        isPending ? "mt-2 flex flex-col opacity-70" : "mt-2 flex flex-col"
      }
    >
      <div className="border-stroke bg-whiteBackground rounded-2xl border p-6">
        <div className="min-w-0">
          <div className="flex items-start gap-3 text-base font-semibold">
            <span className="min-w-0 flex-1 break-words leading-snug">
              #{number} - {title}
            </span>
            {isPending && (
              <span className="text-orange bg-orange/10 shrink-0 animate-pulse rounded-full px-2.5 py-1 text-xs font-medium">
                Pending
              </span>
            )}
            {ipfsUri && <Attachment uri={ipfsUri} />}
          </div>
          <p className="text-secondaryText mt-1 break-words text-sm font-normal leading-5">
            {description}
          </p>
        </div>
        <div className="bg-grey mt-4 flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-2 text-sm font-normal">
          {photoUrl ? (
            <Image
              className="h-8 w-8 rounded-full object-cover"
              alt="profile"
              src={photoUrl}
              width={64}
              height={64}
              unoptimized // IPFS photos bypass the image optimizer, same as vouch avatars
            />
          ) : (
            <Identicon diameter={32} address={item.submitter} />
          )}
          {profile ? (
            <Link
              className="text-primaryText group/external-link inline-flex items-center gap-1.5 font-semibold hover:opacity-80"
              href={`/${prettifyId(profile.pohId as Hash)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.name || shortAddress}
              <ExternalLinkIcon className="text-orange" />
            </Link>
          ) : (
            <ExternalLink
              className="text-primaryText font-semibold hover:opacity-80"
              href={explorerLink(item.submitter, chain)}
            >
              {shortAddress}
            </ExternalLink>
          )}
          <span className="text-secondaryText">
            <TimeAgo time={item.creationTime} />
          </span>
        </div>
      </div>
    </div>
  );
}

interface EvidenceProps {
  pohId: Hash;
  requestIndex: number;
  submitterProfiles: Record<string, EvidenceSubmitterProfile>;
}

export default function Evidence({
  pohId,
  requestIndex,
  submitterProfiles,
}: EvidenceProps) {
  const { effective, pendingAction, pendingEvidenceItem } =
    useRequestOptimistic();
  const isReconciling = pendingAction !== null;
  const chainReq = useChainParam();
  const chainId = useChainId();
  const [modalOpen, setModalOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(
    effective.status === "disputed",
  );
  const [firstEvidenceVisible, setFirstEvidenceVisible] = useState(true);
  const [lastEvidenceVisible, setLastEvidenceVisible] = useState(true);
  // Track the observed elements via state (not refs) so the observer effect
  // re-runs whenever the first/last item actually (re-)mounts — important
  // because the accordion unmounts and re-mounts its children on close/open.
  const [firstEvidenceEl, setFirstEvidenceEl] = useState<HTMLDivElement | null>(
    null,
  );
  const [lastEvidenceEl, setLastEvidenceEl] = useState<HTMLDivElement | null>(
    null,
  );

  const confirmed = effective.evidenceList;
  const confirmedCount = confirmed.length;
  const hasPending = pendingAction === "evidence" && !!pendingEvidenceItem;
  const evidenceItems: Array<{
    item: OptimisticEvidenceItem;
    isPending: boolean;
    number: number;
  }> = [
    ...(hasPending
      ? [
          {
            item: pendingEvidenceItem,
            isPending: true,
            number: confirmedCount + 1,
          },
        ]
      : []),
    ...confirmed.map((item, index) => ({
      item,
      isPending: false,
      number: confirmedCount - index,
    })),
  ];
  useEffect(() => {
    if (!evidenceOpen || !firstEvidenceEl || !lastEvidenceEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === firstEvidenceEl)
            setFirstEvidenceVisible(entry.isIntersecting);
          if (entry.target === lastEvidenceEl)
            setLastEvidenceVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.01 },
    );

    observer.observe(firstEvidenceEl);
    if (lastEvidenceEl !== firstEvidenceEl) observer.observe(lastEvidenceEl);

    return () => observer.disconnect();
  }, [evidenceOpen, firstEvidenceEl, lastEvidenceEl]);

  // Hide the "Scroll to..." shortcuts while the open animation is running:
  // the accordion height transition (550ms, Accordion's ANIMATION_MS) plus the
  // staggered item entries (delay capped at 800ms + 600ms accordionItemIn).
  // Jumping to an anchor mid-animation would land on a moving target.
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (!evidenceOpen) return;

    setIsAnimating(true);
    const timeout = window.setTimeout(
      () => setIsAnimating(false),
      550 + Math.min(evidenceItems.length, 8) * 100 + 600,
    );
    return () => window.clearTimeout(timeout);
  }, [evidenceOpen, evidenceItems.length]);

  if (!chainReq) return null;

  const isEvidenceDisabled = chainReq.id !== chainId;

  const evidenceTrigger = resolveTxState([
    { active: isReconciling, message: "Waiting for indexer" },
    {
      active: isEvidenceDisabled,
      message: `Switch your chain above to ${idToChain(chainReq.id)?.name || "the correct chain"}`,
    },
  ]);

  return (
    <Accordion
      className="request-accordion"
      isOpen={evidenceOpen}
      onToggle={() => setEvidenceOpen((open) => !open)}
      title="Evidence"
      size="lg"
      unmountOnClose
    >
      {requestIndex >= 0 && (
        <>
          <div
            className="mb-4 mt-4 flex animate-accordionItemIn flex-col items-center gap-3"
            id="request-evidence-top"
          >
            <ActionButton
              disabled={evidenceTrigger.disabled}
              onClick={() => setModalOpen(true)}
              label="Add Evidence"
              tooltip={evidenceTrigger.tooltip}
              className="w-[min(100%,10.625rem)]"
            />
            {evidenceItems.length > 1 &&
              !lastEvidenceVisible &&
              !isAnimating && (
                <a
                  className="text-sm text-peach"
                  href="#request-evidence-bottom"
                >
                  Scroll to oldest evidence ↓
                </a>
              )}
          </div>
          <AddEvidenceModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            pohId={pohId}
            requestIndex={requestIndex}
          />
        </>
      )}

      {evidenceItems.map(({ item, isPending, number }, index) => {
        const isFirst = index === 0;
        const isLast = index === evidenceItems.length - 1;

        return (
          <div
            key={item.id}
            className="animate-accordionItemIn"
            style={{ animationDelay: `${Math.min(index + 1, 8) * 100}ms` }}
            id={isLast ? "request-evidence-bottom" : undefined}
            ref={
              isFirst
                ? setFirstEvidenceEl
                : isLast
                  ? setLastEvidenceEl
                  : undefined
            }
          >
            <Item
              number={number}
              item={item}
              isPending={isPending}
              profile={submitterProfiles[item.submitter.toLowerCase()]}
            />
          </div>
        );
      })}

      {requestIndex >= 0 &&
        evidenceItems.length > 1 &&
        !firstEvidenceVisible &&
        !isAnimating && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <a className="text-sm text-peach" href="#request-evidence-top">
              Scroll to latest evidence ↑
            </a>
          </div>
        )}
    </Accordion>
  );
}
