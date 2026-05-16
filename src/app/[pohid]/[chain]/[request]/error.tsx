"use client";

import { useEffect } from "react";

export default function RequestError({
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
    <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
      <div className="border-stroke bg-whiteBackground mb-6 rounded border px-6 py-10 text-center shadow sm:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-semibold text-red-400">
          !
        </div>
        <div className="text-primaryText mt-4 text-2xl font-semibold">
          Request page unavailable
        </div>
        <div className="text-secondaryText mx-auto mt-3 max-w-xl text-sm leading-6 sm:text-base">
          We couldn&apos;t load this request right now. Try again in a moment.
        </div>
        <button
          type="button"
          className="btn-main mt-6 px-4 py-2 normal-case"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
