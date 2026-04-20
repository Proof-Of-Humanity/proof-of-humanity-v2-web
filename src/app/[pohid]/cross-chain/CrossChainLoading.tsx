import React from "react";

export default function CrossChainLoading() {
  return (
    <div className="border-t px-4 py-3">
      <div className="flex min-h-[56px] w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="bg-grey h-3.5 w-20 animate-pulse rounded" />
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-grey h-4 w-4 animate-pulse rounded-full" />
            <div className="bg-grey h-5 w-28 animate-pulse rounded" />
          </div>
          <div className="bg-grey mt-2 h-3.5 w-40 max-w-full animate-pulse rounded" />
        </div>

        <div className="paper border-stroke bg-whiteBackground flex shrink-0 items-center gap-2 px-3 py-2">
          <div className="bg-grey h-8 w-20 animate-pulse rounded" />
          <div className="bg-grey h-8 w-24 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
