import { getProfileTimelineData } from "data/requestTimeline";
import { type Hash } from "viem";

import { getProfilePageData } from "./profilePageData";
import ProfileTimelineError from "./ProfileTimelineError";
import Timeline from "./[chain]/[request]/Timeline";

interface ProfileTimelineSectionProps {
  pohId: Hash;
}

export default async function ProfileTimelineSection({
  pohId,
}: ProfileTimelineSectionProps) {
  try {
    const { profileHeader, profileState } = await getProfilePageData(pohId);
    const { timelineItems } = await getProfileTimelineData(
      pohId,
      profileState.timelineRequests as Parameters<
        typeof getProfileTimelineData
      >[1],
    );

    return <Timeline items={timelineItems} profileHeader={profileHeader} />;
  } catch {
    return <ProfileTimelineError />;
  }
}
