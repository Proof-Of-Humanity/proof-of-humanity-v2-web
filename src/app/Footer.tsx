import Image from "next/image";
import ExternalLink from "components/ExternalLink";

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
];

const Footer: React.FC = () => (
  <div className="bg-whiteBackground bottom-0 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-[20px] border-t border-white/[0.08] px-8 py-4 text-lg text-white sm:justify-between sm:gap-x-[240px]">
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
      {SOCIALS.map((social) => (
        <ExternalLink
          key={social.alt}
          href={social.href}
          className="transition-opacity duration-200 hover:opacity-80"
        >
          <Image alt={social.alt} src={social.src} width={32} height={32} />
        </ExternalLink>
      ))}
    </div>
  </div>
);

export default Footer;
