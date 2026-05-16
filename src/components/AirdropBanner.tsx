"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AirdropBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="gradient relative w-full border-b-2 border-white/30">
      <div className="flex items-center px-4 py-3 sm:px-6">
        <Link
          href="/app/pnk-airdrop"
          className="min-w-0 flex-1 cursor-pointer transition-opacity hover:opacity-90"
        >
          <div className="flex items-center justify-center gap-2 pr-2 text-center text-white">
            <div className="hidden flex-shrink-0 sm:block">
              <Image
                src="/logo/poh-white.svg"
                alt="PoH"
                width={20}
                height={20}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-1 text-sm sm:text-base">
              <span className="font-bold">Airdrop for early adopters:</span>
              <span>Register yourself as human,</span>
              <span className="font-bold">claim 1,200 $PNK</span>
              <span>
                and stake to double your allocation! First 10,000 humans only.
              </span>
            </div>
          </div>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsVisible(false);
          }}
          className="ml-1 flex-shrink-0 p-2 text-white transition-opacity hover:opacity-70"
          aria-label="Close banner"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.414 10l6.293-6.293a1 1 0 10-1.414-1.414L10 8.586 3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293A.998.998 0 0018 17a.999.999 0 00-.293-.707L11.414 10z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
