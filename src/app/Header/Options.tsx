import Image from "next/image";
import React from "react";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import SettingsPopover from "./SettingsPopover";

const Options: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div className="mt-[16px] flex flex-row items-center md:mt-0">
      <SettingsPopover />
      <ExternalLink href="https://snapshot.org/#/poh.eth/">
        <Image alt="snapshot" src="/logo/snapshot.svg" height={16} width={16} />
      </ExternalLink>

      <Popover
        trigger={
          <Image
            alt="question"
            className="ml-2 cursor-pointer"
            src={"/logo/question.svg"}
            height={16}
            width={16}
          />
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
