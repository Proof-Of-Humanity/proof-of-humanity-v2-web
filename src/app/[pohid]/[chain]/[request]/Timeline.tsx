"use client";

import ChainLogo from "components/ChainLogo";
import { TimelineItem } from "data/requestTimeline";
import { idToChain } from "config/chains";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline16.svg";
import CrossCircleIcon from "icons/CrossCircle16.svg";
import NewTabIcon from "icons/NewTab.svg";
import TimelineTransferIcon from "icons/TimelineTransfer.svg";
import { useEffect, useRef, useState } from "react";

interface TimelineProps {
  items: TimelineItem[];
}

const TIMELINE_STYLES: Record<
  TimelineItem["kind"],
  { dot: string; text: string; accent: string }
> = {
  submitted: {
    dot: "border-orange-400",
    text: "text-primaryText",
    accent: "bg-orange-400",
  },
  inReview: {
    dot: "border-sky-400",
    text: "text-primaryText",
    accent: "bg-sky-400",
  },
  challenged: {
    dot: "border-amber-400",
    text: "text-primaryText",
    accent: "bg-amber-400",
  },
  appeal: {
    dot: "border-fuchsia-400",
    text: "text-primaryText",
    accent: "bg-fuchsia-400",
  },
  verified: {
    dot: "border-emerald-400",
    text: "text-primaryText",
    accent: "bg-emerald-400",
  },
  removed: {
    dot: "border-rose-400",
    text: "text-primaryText",
    accent: "bg-rose-400",
  },
  rejected: {
    dot: "border-red-400",
    text: "text-primaryText",
    accent: "bg-red-400",
  },
  expired: {
    dot: "border-slate-500",
    text: "text-primaryText",
    accent: "bg-slate-500",
  },
  withdrawn: {
    dot: "border-slate-300",
    text: "text-primaryText",
    accent: "bg-slate-300",
  },
  transferred: {
    dot: "border-orange-500",
    text: "text-primaryText",
    accent: "bg-orange-500",
  },
  received: {
    dot: "border-teal-500",
    text: "text-primaryText",
    accent: "bg-teal-500",
  },
};

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
});

const ITEM_STEP_MS = 340;
const ITEM_REVEAL_OFFSET_MS = 150;

export default function Timeline({ items }: TimelineProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible]);

  if (!items.length) return null;

  return (
    <div
      ref={rootRef}
      className={`timeline-root mt-10 border-t pt-8 ${isVisible ? "timeline-visible" : "timeline-hidden"}`}
    >
      <h2 className="text-primaryText text-xl font-semibold">Timeline History</h2>
      <div className="mt-6">
        {items.map((item, index) => {
          const styles = TIMELINE_STYLES[item.kind];
          const isLast = index === items.length - 1;
          const lineDelay = `${index * ITEM_STEP_MS}ms`;
          const itemDelay = `${index * ITEM_STEP_MS + ITEM_REVEAL_OFFSET_MS}ms`;
          const isClickable = Boolean(item.externalHref);

          const content = (
            <div className="flex w-full items-start gap-4">
              <div className="flex w-6 shrink-0 flex-col items-center">
                <div
                  className={`timeline-dot-shell bg-whiteBackground ${item.kind === "transferred" ||
                    item.kind === "verified" ||
                    item.kind === "rejected"
                    ? "h-5 w-5 border-transparent -mt-0.5"
                    : styles.dot
                    }`}
                  style={{ animationDelay: itemDelay }}
                >
                  {item.kind === "transferred" ? (
                    <TimelineTransferIcon />
                  ) : item.kind === "verified" ? (
                    <CheckCircleOutlineIcon />
                  ) : item.kind === "rejected" ? (
                    <CrossCircleIcon />
                  ) : (
                    <div className={`timeline-dot-core ${styles.accent}`} />
                  )}
                </div>
                {!isLast && (
                  <div className="timeline-connector-track mt-0.5 self-center translate-x-[0.5px]">
                    <div
                      className={`timeline-connector-fill ${styles.accent}`}
                      style={{ animationDelay: lineDelay }}
                    />
                  </div>
                )}
              </div>
              <div
                className={`timeline-milestone min-w-0 ${isLast ? "pb-0" : "pb-8"}`}
                style={{ animationDelay: itemDelay }}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
                  <span className={`inline-flex items-center gap-1 font-semibold ${styles.text}`}>
                    {item.title}
                    {isClickable && (
                      <span className="text-secondaryText inline-flex">
                        <NewTabIcon className="h-4 w-4 fill-current transition-transform duration-200 group-hover/timeline-link:-translate-y-0.5 group-hover/timeline-link:translate-x-0.5" />
                      </span>
                    )}
                  </span>
                  {item.chainId && item.kind !== "transferred" && (
                    <span className="text-secondaryText inline-flex items-center gap-1 text-sm font-normal">
                      <ChainLogo
                        chainId={item.chainId}
                        className="fill-primaryText h-3.5 w-3.5"
                      />
                      {idToChain(item.chainId)?.name}
                    </span>
                  )}
                </div>
                <div className="text-secondaryText text-sm font-normal">
                  {formatter.format(new Date(item.timestamp * 1000))}
                </div>
              </div>
            </div>
          );

          return (
            <div key={item.id}>
              {item.externalHref ? (
                <a
                  href={item.externalHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group/timeline-link block hover:opacity-90"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
