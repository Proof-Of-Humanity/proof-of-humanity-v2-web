import React from "react";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import SocialHelpIcon from "icons/SocialHelp.svg";
import SocialSnapshotIcon from "icons/SocialSnapshot.svg";
import SettingsPopover from "./SettingsPopover";

const Options: React.FC = () => (
  <div className="mt-[16px] flex flex-row items-center md:mt-0">
    <SettingsPopover />
    <ExternalLink
      href="https://snapshot.org/#/poh.eth/"
      className="icon-btn ml-2 h-9 w-9"
      aria-label="Snapshot"
    >
      <SocialSnapshotIcon />
    </ExternalLink>

    <Popover
      trigger={
        <button
          type="button"
          className="icon-btn ml-2 h-9 w-9"
          aria-label="Open help links"
        >
          <SocialHelpIcon />
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
          Crypto Beginner&apos;s Guide
        </ExternalLink>
        <ExternalLink href="https://kleros.gitbook.io/docs/products/proof-of-humanity/poh-faq">
          FAQ
        </ExternalLink>
      </div>
    </Popover>
  </div>
);

export default Options;
