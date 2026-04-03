import React from "react";

export default function CrossChainError({ error }: { error: Error }) {
  return (
    <div className="border-t px-4 py-3">
      <div className="flex min-h-[56px] w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-secondaryText block text-sm">Cross-chain</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="paper border-orange bg-lightOrange text-orange px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              Error
            </span>
            <span className="text-primaryText truncate font-semibold">
              Unavailable
            </span>
          </div>
          <span className="text-secondaryText mt-2 block truncate text-sm">
            Bridge status could not be loaded.
          </span>
        </div>

        <div
          className="paper border-orange bg-lightOrange flex max-w-[360px] shrink-0 items-center gap-2 px-3 py-2"
          title={error.message}
        >
          <span className="text-orange shrink-0 text-xs font-semibold uppercase tracking-[0.08em]">
            Details
          </span>
          <span className="text-primaryText min-w-0 truncate text-sm">
            {error.message}
          </span>
        </div>
      </div>
    </div>
  );
}
