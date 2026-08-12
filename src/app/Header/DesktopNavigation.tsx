"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { sepolia } from "viem/chains";
import cn from "classnames";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import CaretDownIcon from "icons/CaretDown.svg";
import DashboardIcon from "icons/Dashboard.svg";
import SearchIcon from "icons/SearchMajor.svg";
import RegisterLink from "./RegisterLink";
import { isRegisterActive } from "utils/identifier";

const navLink = (active: boolean) =>
  `relative whitespace-nowrap py-2 text-lg font-semibold transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:rounded-full after:bg-peach after:shadow-[0_0_12px_rgba(255,176,138,0.45)] after:transition-transform after:duration-200 ${
    active
      ? "text-orange after:scale-x-100"
      : "text-secondaryText after:scale-x-0 hover:text-primaryText"
  }`;

interface DesktopNavigationProps {
  web3Loaded: boolean;
  chain: { id: number; name: string };
  pathname: string;
  policy: string;
  me: any;
  address?: `0x${string}`;
  pendingRegisterIntent: boolean;
  setPendingRegisterIntent: (value: boolean) => void;
}

const DesktopNavigation = ({
  web3Loaded,
  chain,
  pathname,
  policy,
  me,
  address,
  pendingRegisterIntent,
  setPendingRegisterIntent,
}: DesktopNavigationProps) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentUrl = searchParams.get("url");
  const policyHref = policy && `/attachment?url=${encodeURIComponent(policy)}`;

  const registerActive = isRegisterActive(me?.pohId, pathname);

  return (
    <div className="my-2 hidden items-center gap-x-8 whitespace-nowrap xl:flex">
      {web3Loaded && chain.id === sepolia.id && (
        <ExternalLink
          href="https://docs.scroll.io/en/user-guide/faucet/"
          className={navLink(false)}
        >
          Faucet
        </ExternalLink>
      )}
      <Link href="/" className={navLink(pathname === "/")}>
        Profiles
      </Link>
      <RegisterLink
        me={me}
        address={address}
        pendingRegisterIntent={pendingRegisterIntent}
        setPendingRegisterIntent={setPendingRegisterIntent}
        className={navLink(registerActive)}
      />
      {policyHref && (
        <Link href={policyHref} className={navLink(currentUrl === policy)}>
          Policy
        </Link>
      )}
      <Link href="/app" className={navLink(pathname.startsWith("/app"))}>
        Rewards
      </Link>
      <Popover
        open={toolsOpen}
        desktopPosition="bottom left"
        onOpen={() => setToolsOpen(true)}
        onClose={() => setToolsOpen(false)}
        className="w-max min-w-48"
        trigger={
          <button
            type="button"
            aria-expanded={toolsOpen}
            className={`${navLink(false)} flex items-center gap-2`}
          >
            Tools
            <CaretDownIcon
              className={cn(
                "h-3 w-3 fill-current text-peach transition-transform duration-200 ease-premium",
                toolsOpen && "rotate-180",
              )}
            />
          </button>
        }
      >
        <div
          className="bg-whiteBackground text-primaryText border-stroke flex origin-top animate-dropdownIn flex-col overflow-hidden rounded-2xl border py-2 shadow-soft"
          onClick={() => setToolsOpen(false)}
        >
          <ExternalLink
            href="https://frabjous-marigold-8334d9.netlify.app"
            className="hover:bg-grey flex items-center gap-2 px-4 py-2 text-sm"
          >
            <DashboardIcon className="h-4 w-4 shrink-0 fill-current text-peach" />
            PoH Dashboard
          </ExternalLink>
          <ExternalLink
            href="https://poh-duplicate-finder.netlify.app"
            className="hover:bg-grey flex items-center gap-2 px-4 py-2 text-sm"
          >
            <SearchIcon className="h-4 w-4 shrink-0 fill-current text-peach" />
            PoH Duplicate Finder
          </ExternalLink>
        </div>
      </Popover>
    </div>
  );
};

export default DesktopNavigation;
