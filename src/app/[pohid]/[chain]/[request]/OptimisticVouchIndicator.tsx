"use client";

import { useRequestOptimistic } from "optimistic/request";

export default function OptimisticVouchIndicator() {
  const { pendingAction } = useRequestOptimistic();

  if (pendingAction !== "vouch" && pendingAction !== "removeVouch") return null;

  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 animate-pulse dark:bg-emerald-900/30 dark:text-emerald-400">
      Pending update
    </span>
  );
}
