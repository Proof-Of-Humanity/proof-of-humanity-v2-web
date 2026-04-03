import { getProfileTimelineData } from "data/requestTimeline";
import { type Hash } from "viem";

import { getProfilePageData } from "./profilePageData";
import { ProfileTimelineSection } from "./TimelineSection";

interface ProfileTimelineShellProps {
  pohId: Hash;
}

export default async function ProfileTimelineShell({
  pohId,
}: ProfileTimelineShellProps) {
  const { profileHeader, profileState } = await getProfilePageData(pohId);
  const timelineDataPromise = getProfileTimelineData(
    pohId,
    profileState.timelineRequests as Parameters<
      typeof getProfileTimelineData
    >[1],
  );

  return (
    <ProfileTimelineSection
      profileHeader={profileHeader}
      timelineDataPromise={timelineDataPromise}
    />
  );
}
