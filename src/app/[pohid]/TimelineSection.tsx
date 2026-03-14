import { getProfileTimelineData } from "data/requestTimeline";
import Timeline from "./[chain]/[request]/Timeline";

type ProfileTimelineData = Awaited<ReturnType<typeof getProfileTimelineData>>;

interface ProfileTimelineSectionProps {
  timelineDataPromise: Promise<ProfileTimelineData>;
}

export async function ProfileTimelineSection({
  timelineDataPromise,
}: ProfileTimelineSectionProps) {
  const { timelineItems } = await timelineDataPromise;

  return <Timeline items={timelineItems} />;
}
