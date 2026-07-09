import Image from "next/image";
import ExternalLink from "components/ExternalLink";

/** Circular social badges are authored at 32×32 — render 1:1. */
const SOCIAL_ICON_SIZE = 32;

const SOCIALS = [
  {
    alt: "snapshot",
    src: "/logo/social-snapshot.svg",
    href: "https://snapshot.org/#/poh.eth/",
  },
  {
    alt: "github",
    src: "/logo/social-github.svg",
    href: "https://github.com/proof-of-humanity",
  },
  {
    alt: "x",
    src: "/logo/social-x.svg",
    href: "https://twitter.com/proofofhumanity",
  },
  {
    alt: "telegram",
    src: "/logo/social-telegram.svg",
    href: "https://t.me/proofhumanity",
  },
] as const;

const Footer: React.FC = () => (
  <div className="header-background bottom-0 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-[20px] px-8 py-4 text-lg text-white shadow-sm sm:justify-between sm:gap-x-[240px]">
    <ExternalLink
      className="flex items-center gap-2 text-sm"
      href="https://kleros.io/"
    >
      BUILT BY{" "}
      <Image alt="kleros" src="/logo/kleros.svg" width={96} height={24} />
    </ExternalLink>

    <div className="flex items-center gap-3">
      {SOCIALS.map((social) => (
        <ExternalLink
          key={social.alt}
          href={social.href}
          className="transition-opacity duration-200 hover:opacity-80"
        >
          <Image
            alt={social.alt}
            src={social.src}
            width={SOCIAL_ICON_SIZE}
            height={SOCIAL_ICON_SIZE}
          />
        </ExternalLink>
      ))}
    </div>
  </div>
);

export default Footer;
