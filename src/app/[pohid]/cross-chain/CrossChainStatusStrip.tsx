type CrossChainStatusStripProps = {
  title: string;
  description: string;
  label?: string;
};

export default function CrossChainStatusStrip({
  title,
  description,
  label = "Cross-chain",
}: CrossChainStatusStripProps) {
  return (
    <div className="border-stroke bg-whiteBackground w-full min-w-0 rounded-2xl border px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-sm font-semibold text-red-400">
            !
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-primaryText text-base font-semibold">
              {title}
            </div>
            <div className="text-secondaryText mt-1 text-sm leading-6">
              {description}
            </div>
          </div>
        </div>
        <div className="text-secondaryText shrink-0 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
          {label}
        </div>
      </div>
    </div>
  );
}
