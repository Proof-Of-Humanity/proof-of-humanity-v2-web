import Image from "next/image";
import React from "react";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import SettingsPopover from "./SettingsPopover";

const Options: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div className="mt-[16px] flex flex-row items-center md:mt-0">
      {isConnected && <SettingsPopover />}
      <ExternalLink
        href="https://snapshot.org/#/poh.eth/"
        className="hover:border-orange ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-[#2F333D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ease-premium"
      >
        <Image alt="snapshot" src="/logo/snapshot.svg" height={15} width={15} />
      </ExternalLink>

      <Popover
        trigger={
          <button className="hover:border-orange ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-[#2F333D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ease-premium">
            <Image
              alt="question"
              src={"/logo/question.svg"}
              height={15}
              width={15}
            />
          </button>
        }
      >
        <div className="grid h-fit grid-cols-1 gap-2 p-2">
          <ExternalLink href="https://t.me/proofhumanity">
            Get Help (English)
          </ExternalLink>
          <ExternalLink href="https://t.me/proofofhumanityenespanol">
            Get Help (Spanish)
          </ExternalLink>
          <ExternalLink href="https://gov.proofofhumanity.id/">
            Forums
          </ExternalLink>
          <ExternalLink href="https://t.me/pohDebug">
            Report Bugs (Telegram)
          </ExternalLink>
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
    </div>
  );
};

export default Options;
