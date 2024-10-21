'use client';

import { getMyData } from 'data/user';
import Hamburger from 'icons/Hamburger.svg';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { useAccount, usePublicClient } from 'wagmi';
import withClientConnected from 'components/HighOrder/withClientConnected';
import useWeb3Loaded from 'hooks/useWeb3Loaded';
import DesktopNavigation from './DesktopNavigation';
import MobileMenu from './MobileMenu';
import Options from './Options';
import WalletSection from './WalletSection';

interface IHeader extends JSX.IntrinsicAttributes {
  policy: string;
}

export default withClientConnected(function Header({ policy }: IHeader) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { chain } = usePublicClient();
  const web3Loaded = useWeb3Loaded();
  const { data: me } = useSWR(address, getMyData);

  const detectTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  };

  useEffect(() => {
    detectTheme();

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
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
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="header-background relative flex h-16 w-full items-center justify-between px-6 pb-2 pt-2 text-lg text-white shadow-sm md:h-16 md:px-8">
      <Link href="/" className="flex w-[156px] items-center">
        <Image
          alt="proof of humanity logo"
          src={isDarkMode ? '/logo/poh-text-orange.svg' : '/logo/poh-text-white.svg'}
          height={48}
          width={156}
        />
      </Link>

      <button className="ml-auto block text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        <Hamburger />
      </button>

      <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:transform">
        <DesktopNavigation {...{ address, me, policy, pathname, chain, web3Loaded }} />
      </div>

      {menuOpen && (
        <MobileMenu ref={menuRef} {...{ isConnected, web3Loaded, address, pathname, me, policy }} />
      )}

      <div className="flex flex-row items-center">
        <div className="hidden md:block">
          <WalletSection {...{ chain, address, isConnected, web3Loaded }} />
        </div>
        <div className="hidden md:block">
          <Options />
        </div>
      </div>
    </header>
  );
});
