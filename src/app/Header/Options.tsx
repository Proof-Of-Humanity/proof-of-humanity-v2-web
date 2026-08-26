import React from "react";
import { useAccount } from "wagmi";
import ExternalLink from "components/ExternalLink";
import Popover from "components/Popover";
import SocialHelpIcon from "icons/SocialHelp.svg";
import SocialSnapshotIcon from "icons/SocialSnapshot.svg";
import ThemeToggle from "components/ThemeToggle";
import SettingsPopover from "./SettingsPopover";

const Options: React.FC = () => {
  const { address } = useAccount();

  return (
    <div className="mt-[16px] flex flex-row items-center md:mt-0">
      <SettingsPopover key={address} />
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
        <div className="grid h-fit grid-cols-1 gap-1 p-2">
          {(
            [
              ["https://t.me/proofhumanity", "Get Help (English)"],
              ["https://t.me/proofofhumanityenespanol", "Get Help (Spanish)"],
              ["https://gov.proofofhumanity.id/", "Forums"],
              ["https://t.me/pohDebug", "Report Bugs (Telegram)"],
              [
                "https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-web/issues",
                "Report Bugs (Github)",
              ],
              [
                "https://docs.kleros.io/tutorials/poh-register-and-vouch",
                "Tutorial",
              ],
              ["https://ethereum.org/en/wallets", "Crypto Beginner's Guide"]
            ] as const
          ).map(([href, label]) => (
            <ExternalLink
              key={href}
              href={href}
              className="text-primaryText hover:text-orange rounded px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
            >
              {label}
            </ExternalLink>
          ))}
        </div>
      </Popover>
      <ThemeToggle className="ml-2 h-9 w-9" />
    </div>
  );
};

export default Options;
