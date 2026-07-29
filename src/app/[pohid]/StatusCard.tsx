import type { ReactNode } from "react";

/** The red "!" disc used by the profile error surfaces. Size comes from the caller. */
export function StatusBadge({ className }: { className: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-red-500/10 font-semibold text-red-400 ${className}`}
    >
      !
    </div>
  );
}

/**
 * Bordered card used by the profile error/placeholder surfaces, with an optional
 * section eyebrow above it. Callers own the card padding and their own content.
 */
export default function StatusCard({
  section,
  className = "",
  children,
}: {
  section?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0">
      {section ? (
        <div className="text-secondaryText text-xs font-semibold uppercase tracking-[0.08em]">
          {section}
        </div>
      ) : null}
      <div
        className={`border-stroke bg-whiteBackground w-full min-w-0 rounded-2xl border ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
