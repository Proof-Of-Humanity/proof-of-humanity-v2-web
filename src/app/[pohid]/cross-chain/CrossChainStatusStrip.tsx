import type { ReactNode } from "react";

import StatusCard, { StatusBadge } from "../StatusCard";

type CrossChainStatusStripProps = {
  title: string;
  children: ReactNode;
  label?: string;
};

export default function CrossChainStatusStrip({
  title,
  children,
  label = "Cross-chain",
}: CrossChainStatusStripProps) {
  return (
    <StatusCard className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <StatusBadge className="h-8 w-8 text-sm" />
          <div className="min-w-0 flex-1">
            <div className="text-primaryText text-base font-semibold">
              {title}
            </div>
            <div className="text-secondaryText mt-1 text-sm leading-6">
              {children}
            </div>
          </div>
        </div>
        <div className="text-secondaryText shrink-0 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
          {label}
        </div>
      </div>
    </StatusCard>
  );
}
