"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
      <div className="border-stroke bg-whiteBackground mb-6 mt-12 flex flex-col items-center rounded-card border px-6 py-10 text-center shadow-soft sm:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-semibold text-red-400">
          !
        </div>
        <div className="text-primaryText mt-4 text-2xl font-semibold">
          Something went wrong
        </div>
        <div className="text-secondaryText mx-auto mt-3 max-w-xl text-sm font-normal leading-6 sm:text-base">
          We couldn&apos;t load this page right now. Our data services may be
          temporarily unavailable. Nothing on chain is affected. Please
          try again in a moment.
        </div>
        <button
          type="button"
          className="btn-primary mt-6 px-5 py-2.5 normal-case"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </button>
      </div>
    </div>
  );
}
