import React from "react";

export default function CrossChainLoading() {
  return (
    <div className="border-stroke flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-4 border-t px-4 py-6">
      <div className="flex items-center gap-2">
        <div className="bg-grey h-4 w-20 animate-pulse rounded" />
        <div className="bg-grey h-6 w-6 animate-pulse rounded-full" />
        <div className="bg-grey h-4 w-16 animate-pulse rounded" />
      </div>
      <div className="bg-grey h-4 w-20 animate-pulse rounded" />
      <div className="bg-grey h-4 w-24 animate-pulse rounded" />
    </div>
  );
}
