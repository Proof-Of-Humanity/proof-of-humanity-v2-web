import type { ComponentType, SVGProps } from "react";

import { WAITING_FOR_INDEXER_TOOLTIP } from "hooks/useActionFeedback";

export const CROSS_CHAIN_MODAL_CLASS =
  "w-[calc(100%-2rem)] max-w-[800px] md:w-[calc(100%-4rem)] xl:w-[800px]";

const WALLET_CONTRACT_CAVEAT =
  "If you use a wallet contract make sure it has same address on both chains.";

export function CrossChainActionTrigger({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  showTooltip = false,
  className = "",
  iconClassName = "",
}: {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  disabled?: boolean;
  showTooltip?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <button
        className={`inline-flex items-center gap-2 text-sm text-peach ${
          disabled ? "opacity-70" : "transition-opacity hover:opacity-70"
        }`}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </button>
      {showTooltip ? (
        <span className="tooltip-surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 text-center text-sm opacity-0 transition-opacity group-hover:opacity-100">
          {WAITING_FOR_INDEXER_TOOLTIP}
        </span>
      ) : null}
    </div>
  );
}

/** Centered title + subtext used at the top of the cross-chain modals. */
export function CrossChainModalHeading({
  title,
  description = WALLET_CONTRACT_CAVEAT,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-primaryText text-2xl font-semibold">{title}</h2>
      <p className="text-secondaryText text-sm">{description}</p>
    </div>
  );
}
