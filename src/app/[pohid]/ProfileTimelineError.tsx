import RetryButton from "./RetryButton";

type ProfileTimelineErrorProps = {
  title?: string;
  description?: string;
};

export default function ProfileTimelineError({
  title = "Timeline unavailable",
  description = "We couldn't load request history right now. The profile summary above is still available.",
}: ProfileTimelineErrorProps) {
  return (
    <div className="w-full">
      <div className="text-primaryText mb-4 mt-5 text-2xl font-semibold">
        History
      </div>
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center">
          <div className="h-4 w-4 rounded-full border-2 border-red-300 bg-red-500/10" />
          <div className="border-stroke mt-1 h-40 w-0 border-l" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="paper border-stroke bg-whiteBackground rounded-2xl px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-400">
                !
              </div>
              <div className="text-primaryText text-base font-semibold">
                {title}
              </div>
            </div>
            <div className="text-secondaryText mt-3 text-sm leading-6">
              {description}
            </div>
            <RetryButton className="paper border-stroke bg-whiteBackground text-primaryText mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold" />
          </div>
        </div>
      </div>
    </div>
  );
}
