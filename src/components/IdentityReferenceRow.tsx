import ChainLogo from "components/ChainLogo";
import CopyButton from "components/CopyButton";
import ExternalLink from "components/ExternalLink";
import Identicon from "components/Identicon";
import { idToChain } from "config/chains";
import ArrowRight from "icons/ArrowRight.svg";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import cn from "classnames";

interface IdentityReferenceRowProps {
  chainId: number;
  avatar: ReactNode;
  action: ReactNode;
  copyLabel: string;
  value: string;
  compact?: boolean;
}

function IdentityReferenceRow({
  chainId,
  avatar,
  action,
  copyLabel,
  value,
  compact = false,
}: IdentityReferenceRowProps) {
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
          {avatar}
        </div>
        <ChainLogo
          chainId={chainId}
          className="absolute left-[2.375rem] top-2 h-6 w-6"
        />
        <span className="sr-only">{idToChain(chainId)?.name} chain</span>
      </div>
      {action}
      <div
        className={cn(
          "flex min-w-0 gap-2 text-peach",
          compact
            ? "order-2 items-center justify-center text-sm"
            : "order-3 col-span-2 items-start text-xs md:order-2 md:col-span-1 md:items-center md:justify-center md:text-sm",
        )}
      >
        <span className="min-w-0 break-all leading-5 md:truncate">{value}</span>
        <CopyButton value={value} label={copyLabel} />
      </div>
    </div>
  );
}

const linkClassName = (compact: boolean) =>
  cn("icon-btn h-8 w-8", compact ? "order-3" : "order-2 md:order-3");

export function WalletReferenceRow({
  chainId,
  address,
  href,
  value,
  compact,
}: {
  chainId: number;
  address: string | null | undefined;
  href: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <IdentityReferenceRow
      chainId={chainId}
      avatar={<Identicon diameter={40} address={address} />}
      value={value}
      compact={compact}
      copyLabel="Copy wallet address"
      action={
        <ExternalLink
          aria-label={`Open ${value} in block explorer`}
          className={linkClassName(!!compact)}
          href={href}
        >
          <ArrowRight />
        </ExternalLink>
      }
    />
  );
}

export function PohIdReferenceRow({
  chainId,
  href,
  value,
  compact,
}: {
  chainId: number;
  href: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <IdentityReferenceRow
      chainId={chainId}
      avatar={
        <Image alt="POH ID" src="/logo/pohid.svg" height={40} width={40} />
      }
      value={value}
      compact={compact}
      copyLabel="Copy POH ID"
      action={
        <Link
          aria-label={`Open POH ID ${value}`}
          className={linkClassName(!!compact)}
          href={href}
        >
          <ArrowRight />
        </Link>
      }
    />
  );
}
