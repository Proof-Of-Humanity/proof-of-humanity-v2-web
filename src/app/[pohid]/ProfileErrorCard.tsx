type ProfileErrorCardProps = {
  label?: string;
  title: string;
  description?: string;
  nextStep?: string;
};

export default function ProfileErrorCard({
  label,
  title,
  description,
  nextStep,
}: ProfileErrorCardProps) {
  return (
    <div className="paper border-stroke bg-whiteBackground w-full min-w-0 rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-red-300">
          !
        </div>
        <div className="min-w-0 flex-1">
          {label ? (
            <div className="text-secondaryText mb-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              {label}
            </div>
          ) : null}
          <div className="text-primaryText text-base font-semibold">
            {title}
          </div>
          {description ? (
            <div className="text-primaryText mt-1 text-sm leading-6">
              {description}
            </div>
          ) : null}
          {nextStep ? (
            <div className="text-secondaryText mt-2 text-sm leading-6">
              {nextStep}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
