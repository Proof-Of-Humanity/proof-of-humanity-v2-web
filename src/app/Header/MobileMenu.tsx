"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ref, forwardRef } from "react";
import ExternalLink from "components/ExternalLink";
import DashboardIcon from "icons/Dashboard.svg";
import SearchIcon from "icons/SearchMajor.svg";
import Options from "./Options";
import RegisterLink from "./RegisterLink";
import WalletSection from "./WalletSection";
import { isRegisterActive } from "utils/identifier";

interface MobileMenuProps {
  policy: string;
  me: any;
  pathname: string;
  address?: `0x${string}`;
  web3Loaded: boolean;
  isConnected: boolean;
  chain: { id: number; name: string };
  pendingRegisterIntent: boolean;
  setPendingRegisterIntent: (value: boolean) => void;
  onClose: () => void;
}

const MobileMenu = forwardRef(
  (
    {
      policy,
      me,
      pathname,
      address,
      web3Loaded,
      isConnected,
      chain,
      pendingRegisterIntent,
      setPendingRegisterIntent,
      onClose,
    }: MobileMenuProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const searchParams = useSearchParams();
    const currentUrl = searchParams.get("url");
    const policyHref =
      policy && `/attachment?url=${encodeURIComponent(policy)}`;
    const registerActive = isRegisterActive(me?.pohId, pathname);

    return (
      <div
        ref={ref}
        className="header-background absolute left-0 right-0 top-16 z-[60] w-full border-b border-white/[0.08] p-4 xl:hidden"
      >
        <nav className="flex flex-col items-center gap-y-4 text-center">
          <Link
            href="/"
            onClick={onClose}
            className={`text-lg ${pathname === "/" ? "font-bold" : ""}`}
          >
            Profiles
          </Link>
          <RegisterLink
            me={me}
            address={address}
            pendingRegisterIntent={pendingRegisterIntent}
            setPendingRegisterIntent={setPendingRegisterIntent}
            onClick={onClose}
            className={`text-lg ${registerActive ? "font-bold" : ""}`}
          />
          {policyHref && (
            <Link
              href={policyHref}
              onClick={onClose}
              className={`text-lg ${currentUrl === policy ? "font-bold" : ""}`}
            >
              Policy
            </Link>
          )}
          <Link
            href="/app"
            onClick={onClose}
            className={`text-lg ${pathname.startsWith("/app") ? "font-bold" : ""}`}
          >
            Rewards
          </Link>
          <span className="text-sm font-semibold uppercase tracking-wide text-white/70 dark:text-secondaryText">
            Tools
          </span>
          <ExternalLink
            href="https://frabjous-marigold-8334d9.netlify.app"
            className="flex items-center gap-2 text-lg text-white hover:text-white"
          >
            <DashboardIcon className="h-4 w-4 fill-current text-white dark:text-peach" />
            PoH Dashboard
          </ExternalLink>
          <ExternalLink
            href="https://poh-duplicate-finder.netlify.app"
            className="flex items-center gap-2 text-lg text-white hover:text-white"
          >
            <SearchIcon className="h-4 w-4 fill-current text-white dark:text-peach" />
            PoH Duplicate Finder
          </ExternalLink>
        </nav>

        <div className="mt-4 flex justify-center">
          <WalletSection
            {...{
              chain,
              address,
              isConnected,
              web3Loaded,
            }}
          />
        </div>
        <div className="mt-3 flex justify-center">
          <Options />
        </div>
      </div>
    );
  },
);

export default MobileMenu;
