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
import DesktopNavigation from "./DesktopNavigation";
import MobileMenu from "./MobileMenu";
import Options from "./Options";
import RegisterLink from "./RegisterLink";
import WalletSection from "./WalletSection";

interface IHeader {
  policy: string;
}

export default function Header({ policy }: IHeader) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [pendingRegisterIntent, setPendingRegisterIntent] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const chainId = useChainId()

  const config = useConfig()
  const chains = config.chains
  
  const chain = chains.find(chain => chain.id === chainId)
  const web3Loaded = useWeb3Loaded();
  const { data: me } = useSWR(address, getMyData);
  const showRewardsCta = Boolean(isConnected && me?.pohId);
  const showRegisterCta = !me?.pohId;

  const detectTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  };

  useEffect(() => {
    detectTheme();

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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
    <header className="header-background relative flex h-16 w-full items-center justify-between px-6 pb-2 pt-2 text-lg text-white shadow-sm md:h-16 md:px-8">
      <Link href="/" className="flex w-[156px] items-center">
        <Image
          alt="proof of humanity logo"
          src={
            isDarkMode
              ? "/logo/poh-text-orange.svg"
              : "/logo/poh-text-white.svg"
          }
          height={48}
          width={156}
        />
      </Link>

      <div className="ml-auto flex items-center gap-2 md:hidden">
        {showRewardsCta ? (
          <Link
            href="/app"
            className={`rounded-full border border-white/50 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/15 ${
              pathname.startsWith("/app") ? "bg-white/20" : ""
            }`}
          >
            Rewards
          </Link>
        ) : showRegisterCta ? (
          <RegisterLink
            me={me}
            address={address}
            pathname={pathname}
            pendingRegisterIntent={pendingRegisterIntent}
            setPendingRegisterIntent={setPendingRegisterIntent}
            className={`rounded-full border border-white/50 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/15 ${
              pathname.includes("/claim") ? "bg-white/20" : ""
            }`}
          />
        ) : null}
        <button
          className="block text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Hamburger />
        </button>
      </div>

      {chain && (
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:transform">
          <DesktopNavigation
            {...{ address, me, policy, pathname, chain, web3Loaded, pendingRegisterIntent, setPendingRegisterIntent }}
          />
        </div>
      )}

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

      <div className="flex flex-row items-center">
        <div className="hidden md:block">
          {chain && <WalletSection {...{ chain, address, isConnected, web3Loaded }} />}
        </div>
        <div className="hidden md:block">
          <Options />
        </div>
      </div>
    </header>
  );
}
