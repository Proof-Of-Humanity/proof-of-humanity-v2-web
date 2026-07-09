"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sepolia } from "viem/chains";
import ExternalLink from "components/ExternalLink";
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
  const searchParams = useSearchParams();
  const currentUrl = searchParams.get("url");
  const policyHref = policy && `/attachment?url=${encodeURIComponent(policy)}`;

  const registerActive = isRegisterActive(me?.pohId, pathname);

  return (
    <div className="my-2 hidden items-center gap-x-8 whitespace-nowrap md:flex">
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
    </div>
  );
};

export default DesktopNavigation;
