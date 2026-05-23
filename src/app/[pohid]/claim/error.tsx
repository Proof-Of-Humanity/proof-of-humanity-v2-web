"use client";

import { useEffect } from "react";

export default function ClaimError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="content paper flex flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <div className="border-stroke bg-whiteBackground flex w-full flex-col items-center rounded-3xl border px-6 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-semibold text-red-400">
          !
        </div>
        <div className="text-primaryText mt-4 text-2xl font-semibold">
          Claim page unavailable
        </div>
        <div className="text-secondaryText mt-3 text-sm leading-6 sm:text-base">
          We couldn&apos;t load the registration form right now. Try again in a
          moment.
        </div>
        <button
          type="button"
          className="btn-primary mt-6 px-5 py-2.5 normal-case"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
