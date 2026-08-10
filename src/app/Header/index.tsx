"use client";

import { getMyData } from "data/user";
import Hamburger from "icons/Hamburger.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useAccount, useChainId, useConfig } from "wagmi";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { isRegisterActive } from "utils/identifier";
import DesktopNavigation from "./DesktopNavigation";
import MobileMenu from "./MobileMenu";
import Options from "./Options";
import WalletSection from "./WalletSection";
import RegisterLink from "./RegisterLink";

interface IHeader {
  policy: string;
}

export default function Header({ policy }: IHeader) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [pendingRegisterIntent, setPendingRegisterIntent] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const config = useConfig();
  const chains = config.chains;

  const chain = chains.find((chain) => chain.id === chainId);
  const web3Loaded = useWeb3Loaded();
  const { data: me } = useSWR(address, getMyData);
  const showRewardsCta = Boolean(isConnected && me?.pohId);
  const showRegisterCta = !me?.pohId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="header-background relative w-full border-b border-white/[0.08] text-lg text-white">
      <div className="app-container relative flex h-16 items-center justify-between pb-2 pt-2">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            alt="proof of humanity logo"
            src="/logo/poh.svg"
            height={48}
            width={185}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 xl:hidden">
          {showRewardsCta ? (
            <Link
              href="/app"
              className={`hover:border-orange rounded-full border border-white/[0.08] bg-[#2F333D] px-4 py-2 text-sm font-semibold text-white transition ${
                pathname.startsWith("/app") ? "text-orange" : ""
              }`}
            >
              Rewards
            </Link>
          ) : showRegisterCta ? (
            <RegisterLink
              me={me}
              address={address}
              pendingRegisterIntent={pendingRegisterIntent}
              setPendingRegisterIntent={setPendingRegisterIntent}
              className={`hover:border-orange rounded-full border border-white/[0.08] bg-[#2F333D] px-4 py-2 text-sm font-semibold text-white transition ${
                isRegisterActive(me?.pohId, pathname) ? "text-orange" : ""
              }`}
            />
          ) : null}
          <button
            className="hover:border-orange flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-[#2F333D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ease-premium"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Hamburger />
          </button>
        </div>

        {chain && (
          <div className="xl:absolute xl:left-1/2 xl:top-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 xl:transform">
            <DesktopNavigation
              {...{
                address,
                me,
                policy,
                pathname,
                chain,
                web3Loaded,
                pendingRegisterIntent,
                setPendingRegisterIntent,
              }}
            />
          </div>
        )}

        <div className="flex flex-row items-center gap-3">
          {chain && (
            <div className="hidden xl:block">
              <WalletSection {...{ chain, address, isConnected, web3Loaded }} />
            </div>
          )}
          <div className="hidden xl:block">
            <Options />
          </div>
        </div>
      </div>

      {menuOpen && chain && (
        <MobileMenu
          ref={menuRef}
          {...{
            isConnected,
            web3Loaded,
            address,
            pathname,
            me,
            policy,
            chain,
            pendingRegisterIntent,
            setPendingRegisterIntent,
          }}
        />
      )}
    </header>
  );
}
