import { twMerge } from "tailwind-merge";

import NewTabIcon from "icons/NewTab.svg";

/**
 * Trailing "opens in a new tab" icon that lifts up-right when its enclosing
 * link is hovered. Put `group/external-link inline-flex items-center gap-1` on
 * the link (or button) that wraps it.
 */
export default function ExternalLinkIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <NewTabIcon
      className={twMerge(
        "h-4 w-4 shrink-0 fill-current transition-transform duration-200 group-hover/external-link:-translate-y-0.5 group-hover/external-link:translate-x-0.5",
        className,
      )}
    />
  );
}
