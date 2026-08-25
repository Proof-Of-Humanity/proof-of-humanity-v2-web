"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import cn from "classnames";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import CaretDownIcon from "icons/CaretDown.svg";
import DashboardIcon from "icons/Dashboard.svg";
import SearchIcon from "icons/SearchMajor.svg";
import RegisterLink from "./RegisterLink";
import { isRegisterActive } from "utils/identifier";

const navLink = (active: boolean) =>
  `nav-underline relative whitespace-nowrap py-2 text-lg font-semibold transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:rounded-full after:transition-transform after:duration-200 ${
    active
      ? "nav-link-active after:scale-x-100"
      : "nav-link-idle after:scale-x-0"
  }`;

interface DesktopNavigationProps {
  pathname: string;
  policy: string;
  me: any;
  address?: `0x${string}`;
  pendingRegisterIntent: boolean;
  setPendingRegisterIntent: (value: boolean) => void;
}

const DesktopNavigation = ({
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
                "nav-caret h-3 w-3 fill-current transition-transform duration-200 ease-premium",
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
            href="https://poh-dashboard.netlify.app"
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
