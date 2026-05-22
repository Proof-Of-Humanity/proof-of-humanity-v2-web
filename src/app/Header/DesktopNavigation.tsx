"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sepolia } from "viem/chains";
import ExternalLink from "components/ExternalLink";
import RegisterLink from "./RegisterLink";
import { prettifyId } from "utils/identifier";

const navLink = (active: boolean) =>
  `whitespace-nowrap text-lg font-semibold transition-colors duration-200 ${
    active ? "text-white" : "text-white/70 hover:text-white"
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

  const registerActive = me?.pohId
    ? pathname === `/${prettifyId(me.pohId)}`
    : pathname.includes("/claim");

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
      <Link
        href={`/attachment?url=${encodeURIComponent(policy)}`}
        className={navLink(!!currentUrl?.includes(policy))}
      >
        Policy
      </Link>
      <Link href="/app" className={navLink(pathname.startsWith("/app"))}>
        Rewards
      </Link>
    </div>
  );
};

export default DesktopNavigation;
