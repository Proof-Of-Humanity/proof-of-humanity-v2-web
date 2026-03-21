"use client";

import { useRequestOptimistic } from "optimistic/request";

interface OptimisticVouchIndicatorProps {
  serverCount: number;
}

export default function OptimisticVouchIndicator({
  serverCount,
}: OptimisticVouchIndicatorProps) {
  const {
    effective: { validVouches: effectiveCount },
  } = useRequestOptimistic();
  const diff = effectiveCount - serverCount;

  if (diff <= 0) return null;

  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 animate-pulse dark:bg-emerald-900/30 dark:text-emerald-400">
      +{diff} pending
    </span>
  );
}
