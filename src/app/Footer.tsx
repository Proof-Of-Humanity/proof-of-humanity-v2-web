import Image from 'next/image';
import ExternalLink from 'components/ExternalLink';

const Footer: React.FC = () => (
  <div className="header-background bottom-0 flex w-full flex-wrap items-center justify-center gap-x-[240px] gap-y-[20px] px-8 py-4 text-lg text-white shadow-sm sm:justify-between">
    <ExternalLink className="flex items-center gap-2 text-sm" href="https://kleros.io/">
      BUILT BY <Image alt="kleros" src="/logo/kleros.svg" width={96} height={24} />
    </ExternalLink>

    <div className="flex items-center gap-4">
      <ExternalLink href="https://snapshot.org/#/poh.eth/">
        <Image alt="snapshot" src="/logo/snapshot.svg" width={20} height={20} />
      </ExternalLink>
      <ExternalLink href="https://github.com/proof-of-humanity">
        <Image alt="github" src="/logo/github.svg" width={20} height={20} />
      </ExternalLink>
      <ExternalLink href="https://twitter.com/proofofhumanity">
        <Image alt="twitter" src="/logo/twitter.svg" width={20} height={20} />
      </ExternalLink>
      <ExternalLink href="https://t.me/proofhumanity">
        <Image alt="telegram" src="/logo/telegram.svg" width={20} height={20} />
      </ExternalLink>
    </div>
  </div>
);

export default Footer;
