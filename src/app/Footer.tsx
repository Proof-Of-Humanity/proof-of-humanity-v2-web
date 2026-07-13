import Image from "next/image";
import ExternalLink from "components/ExternalLink";
import SocialGitHubIcon from "icons/SocialGitHub.svg";
import SocialSnapshotIcon from "icons/SocialSnapshot.svg";
import SocialTelegramIcon from "icons/SocialTelegram.svg";
import SocialXIcon from "icons/SocialX.svg";

const SOCIALS = [
  {
    alt: "Snapshot",
    href: "https://snapshot.org/#/poh.eth/",
    Icon: SocialSnapshotIcon,
  },
  {
    alt: "GitHub",
    href: "https://github.com/proof-of-humanity",
    Icon: SocialGitHubIcon,
  },
  {
    alt: "X",
    href: "https://twitter.com/proofofhumanity",
    Icon: SocialXIcon,
  },
  {
    alt: "Telegram",
    href: "https://t.me/proofhumanity",
    Icon: SocialTelegramIcon,
  },
] as const;

const Footer: React.FC = () => (
  <div className="bg-whiteBackground w-full border-t border-white/[0.08] text-lg text-white">
    <div className="app-container flex flex-wrap items-center justify-center gap-x-4 gap-y-[20px] py-4 sm:justify-between">
      <ExternalLink
        className="flex items-center gap-2 text-sm"
        href="https://kleros.io/"
      >
        <Image
          alt="built by kleros"
          src="/logo/built-by-kleros.svg"
          width={153}
          height={24}
        />
      </ExternalLink>

      <div className="flex items-center gap-3">
        {SOCIALS.map(({ alt, href, Icon }) => (
          <ExternalLink
            key={alt}
            href={href}
            className="icon-btn h-9 w-9"
            aria-label={alt}
          >
            <Icon />
          </ExternalLink>
        ))}
      </div>
    </div>
  </div>
);

export default Footer;
