"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ref, forwardRef } from "react";
import Options from "./Options";
import RegisterLink from "./RegisterLink";
import WalletSection from "./WalletSection";

interface MobileMenuProps {
  policy: string;
  me: any;
  pathname: string;
  address?: `0x${string}`;
  web3Loaded: boolean;
  isConnected: boolean;
  pendingRegisterIntent: boolean;
  setPendingRegisterIntent: (value: boolean) => void;
}

const MobileMenu = forwardRef(
  (
    { policy, me, pathname, address, web3Loaded, isConnected, pendingRegisterIntent, setPendingRegisterIntent }: MobileMenuProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const searchParams = useSearchParams();
    const currentUrl = searchParams.get("url");

    return (
      <div
        ref={ref}
        className="header-background absolute right-0 top-16 z-10 w-64 rounded p-4 shadow-lg md:hidden"
      >
        <nav className="flex flex-col gap-y-4">
          <Link href="/" className={`${pathname === "/" ? "font-bold" : ""}`}>
            Profiles
          </Link>
          <RegisterLink
            me={me}
            address={address}
            pathname={pathname}
            pendingRegisterIntent={pendingRegisterIntent}
            setPendingRegisterIntent={setPendingRegisterIntent}
            className={`text-lg ${pathname.includes("/claim") ? "font-bold" : ""}`}
          />
          <Link
            href={`/attachment?url=${policy}`}
            className={`text-lg ${currentUrl?.includes(policy) ? "font-bold" : ""}`}
          >
            Policy
          </Link>
          <Link 
            href="/app" 
            className={`${pathname.startsWith("/app") ? "font-bold" : ""}`}
          >
            Rewards
          </Link>
        </nav>

        <div className="mt-4">
          <WalletSection
            {...{
              chain: { id: 1, name: "Ethereum" },
              address,
              isConnected,
              web3Loaded,
            }}
          />
        </div>
        <Options />
      </div>
    );
  },
);

export default MobileMenu;
