type ProfileSectionPlaceholderErrorProps = {
  section: string;
  title: string;
  trailingText?: string;
};

export default function ProfileSectionPlaceholderError({
  section,
  title,
  trailingText = "Retry later",
}: ProfileSectionPlaceholderErrorProps) {
  return (
    <div className="w-full">
      <div className="text-secondaryText text-xs font-semibold uppercase tracking-[0.08em]">
        {section}
      </div>
      <div className="border-stroke bg-whiteBackground mt-3 flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-400">
            !
          </div>
          <div className="text-primaryText text-sm font-semibold">{title}</div>
        </div>
        <div className="text-secondaryText shrink-0 text-xs">
          {trailingText}
        </div>
      </div>
    </div>
  );
}
