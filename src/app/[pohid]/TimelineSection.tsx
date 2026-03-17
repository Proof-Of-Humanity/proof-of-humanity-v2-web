import { getProfileTimelineData } from "data/requestTimeline";
import type { ProfileTimelineHeaderProps } from "./ProfileTimelineHeader";
import Timeline from "./[chain]/[request]/Timeline";

type ProfileTimelineData = Awaited<ReturnType<typeof getProfileTimelineData>>;

interface ProfileTimelineSectionProps {
  timelineDataPromise: Promise<ProfileTimelineData>;
  profileHeader?: ProfileTimelineHeaderProps;
}

export async function ProfileTimelineSection({
  timelineDataPromise,
  profileHeader,
}: ProfileTimelineSectionProps) {
  const { timelineItems } = await timelineDataPromise;

  return <Timeline items={timelineItems} profileHeader={profileHeader} />;
}
