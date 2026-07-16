import ChainLogo from "components/ChainLogo";
import CopyButton from "components/CopyButton";
import ExternalLink from "components/ExternalLink";
import { idToChain } from "config/chains";
import ArrowRight from "icons/ArrowRight.svg";
import Link from "next/link";
import type { ReactNode } from "react";
import cn from "classnames";

interface IdentityReferenceRowProps {
  chainId: number;
  children: ReactNode;
  href: string;
  value: string;
  external?: boolean;
  compact?: boolean;
}

export default function IdentityReferenceRow({
  chainId,
  children,
  href,
  value,
  external = false,
  compact = false,
}: IdentityReferenceRowProps) {
  const linkClassName = cn(
    "icon-btn h-8 w-8",
    compact ? "order-3" : "order-2 md:order-3",
  );
  const linkContent = <ArrowRight />;

  return (
    <div
      className={cn(
        "border-stroke bg-whiteBackground grid w-full items-center gap-2 rounded-input border px-4",
        compact
          ? "min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] py-1"
          : "min-h-[8.25rem] grid-cols-[1fr_auto] py-3 md:min-h-12 md:grid-cols-[auto_minmax(0,1fr)_auto] md:py-1",
      )}
    >
      <div className="relative h-10 w-[3.875rem]">
        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center">
          {children}
        </div>
        <ChainLogo
          chainId={chainId}
          className="absolute left-[2.375rem] top-2 h-6 w-6"
        />
        <span className="sr-only">{idToChain(chainId)?.name} chain</span>
      </div>
      {external ? (
        <ExternalLink
          aria-label={`Open ${value} in block explorer`}
          className={linkClassName}
          href={href}
        >
          {linkContent}
        </ExternalLink>
      ) : (
        <Link
          aria-label={`Open POH ID ${value}`}
          className={linkClassName}
          href={href}
        >
          {linkContent}
        </Link>
      )}
      <div
        className={cn(
          "flex min-w-0 gap-2 text-peach",
          compact
            ? "order-2 items-center justify-center text-sm"
            : "order-3 col-span-2 items-start text-xs md:order-2 md:col-span-1 md:items-center md:justify-center md:text-sm",
        )}
      >
        <span className="min-w-0 break-all leading-5 md:truncate">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}
