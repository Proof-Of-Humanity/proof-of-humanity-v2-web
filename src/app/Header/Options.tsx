import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ExternalLink from 'components/ExternalLink';
import Popover from 'components/Popover';

const Options: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="mt-[16px] flex flex-row md:mt-0">
      <ExternalLink href="https://snapshot.org/#/poh.eth/">
        <Image alt="snapshot" src="/logo/snapshot.svg" height={16} width={16} />
      </ExternalLink>

      <Popover
        trigger={
          <Image
            alt="question"
            className="ml-2 cursor-pointer"
            src={'/logo/question.svg'}
            height={16}
            width={16}
          />
        }
      >
        <div className="grid h-fit grid-cols-1 gap-2 p-2">
          <ExternalLink href="https://t.me/proofhumanity">Get Help (English)</ExternalLink>
          <ExternalLink href="https://t.me/proofofhumanityenespanol">
            Get Help (Spanish)
          </ExternalLink>
          <ExternalLink href="https://gov.proofofhumanity.id/">Forums</ExternalLink>
          <ExternalLink href="https://t.me/pohDebug">Report Bugs (Telegram)</ExternalLink>
          <ExternalLink href="https://github.com/Proof-Of-Humanity/proof-of-humanity-web/issues">
            Report Bugs (Github)
          </ExternalLink>
          <ExternalLink href="https://kleros.gitbook.io/docs/products/proof-of-humanity/proof-of-humanity-tutorial">
            Tutorial
          </ExternalLink>
          <ExternalLink href="https://ethereum.org/en/wallets">
            Crypto Beginner's Guide
          </ExternalLink>
          <ExternalLink href="https://kleros.gitbook.io/docs/products/proof-of-humanity/poh-faq">
            FAQ
          </ExternalLink>
        </div>
      </Popover>

      <Image
        alt="toggle theme"
        onClick={toggleTheme}
        className="ml-2 cursor-pointer"
        src={isDarkMode ? ' /logo/light-icon.svg' : '/logo/night-icon.svg'}
        height={16}
        width={16}
      />
    </div>
  );
};

export default Options;
