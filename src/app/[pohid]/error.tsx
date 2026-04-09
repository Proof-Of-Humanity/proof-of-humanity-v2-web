"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Error({
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
    <div className="content">
      <div className="paper relative mt-24 flex items-center justify-center px-6 pb-10 pt-20">
        <div className="bordered absolute -top-16 left-1/2 -translate-x-1/2 rounded-full shadow">
          <div className="bg-whiteBackground h-32 w-32 rounded-full px-6 pt-5">
            <Image
              alt="poh id"
              src="/logo/pohid.svg"
              height={128}
              width={128}
            />
          </div>
        </div>

        <div className="border-stroke bg-whiteBackground flex w-full max-w-2xl flex-col items-center rounded-3xl border px-6 py-8 text-center sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-semibold text-red-400">
            !
          </div>
          <div className="text-primaryText mt-4 text-2xl font-semibold">
            Profile page unavailable
          </div>
          <div className="text-secondaryText mt-3 text-sm leading-6 sm:text-base">
            We couldn&apos;t load this profile right now. Try again in a moment.
          </div>
          <button
            className="btn-main mt-6 px-4 py-2 normal-case"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
