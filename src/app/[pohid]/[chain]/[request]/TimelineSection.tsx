import { getRequestTimelineData } from "data/requestTimeline";
import { SupportedChainId } from "config/chains";
import Info from "./Info";
import Timeline from "./Timeline";

type TimelineData = Awaited<ReturnType<typeof getRequestTimelineData>>;

interface TimelineSectionProps {
  chainId: SupportedChainId;
  timelineDataPromise: Promise<TimelineData>;
}

export async function RequestInfoSection({
  chainId,
  timelineDataPromise,
}: TimelineSectionProps) {
  const { requestCounts } = await timelineDataPromise;

  return <Info label="POH ID" nbRequests={requestCounts[chainId]} />;
}

export function RequestInfoSectionSkeleton() {
  return <div className="bg-grey h-6 w-28 animate-pulse rounded" />;
}

export async function TimelineHistorySection({
  timelineDataPromise,
}: Pick<TimelineSectionProps, "timelineDataPromise">) {
  const { timelineItems } = await timelineDataPromise;

  return <Timeline items={timelineItems} />;
}

export function TimelineHistorySectionSkeleton() {
  return (
    <div className="mt-8 border-t pt-8">
      <div className="bg-grey h-7 w-44 animate-pulse rounded" />
      <div className="mt-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex w-full gap-4">
            <div className="flex w-6 shrink-0 flex-col items-center">
              <div className="bg-grey h-5 w-5 animate-pulse rounded-full" />
              {index === 0 && (
                <div className="bg-grey mt-2 h-10 w-px translate-x-[0.5px] animate-pulse" />
              )}
            </div>
            <div className={`min-w-0 flex-1 ${index === 1 ? "pb-0" : "pb-8"}`}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <div className="bg-grey h-5 w-40 animate-pulse rounded" />
                <div className="bg-grey h-4 w-20 animate-pulse rounded" />
              </div>
              <div className="bg-grey mt-2 h-4 w-28 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
