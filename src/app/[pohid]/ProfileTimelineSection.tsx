import { getProfileTimelineData } from "data/requestTimeline";
import { type Hash } from "viem";

import {
  getProfileBaseData,
  getProfileRequestCardData,
} from "./profilePageData";
import ProfileTimelineError from "./ProfileTimelineError";
import Timeline from "./[chain]/[request]/Timeline";
import ProfileTimelineHeader from "./ProfileTimelineHeader";

interface ProfileTimelineSectionProps {
  pohId: Hash;
}

type ProfileBaseData = Awaited<ReturnType<typeof getProfileBaseData>>;
type TimelineHeaderRequest = ProfileBaseData["timelineRequests"][number];

async function ProfileTimelineHeaderSection({
  pohId,
  request,
}: ProfileTimelineSectionProps & { request?: TimelineHeaderRequest }) {
  if (!request) return null;

  try {
    const headerRequest = await getProfileRequestCardData(pohId, request);

    return (
      <ProfileTimelineHeader
        claimer={headerRequest.identityClaimer}
        evidence={headerRequest.identityEvidenceGroup.evidence}
        requester={headerRequest.identityRequester}
      />
    );
  } catch {
    return null;
  }
}

export default async function ProfileTimelineSection({
  pohId,
}: ProfileTimelineSectionProps) {
  try {
    const {
      pageState,
      latestWinningRequest,
      latestNonTransferRequest,
      timelineRequests,
    } = await getProfileBaseData(pohId);
    const { timelineItems } = await getProfileTimelineData(
      pohId,
      timelineRequests as Parameters<typeof getProfileTimelineData>[1],
    );
    const usesWinningRequestHeader =
      pageState === "CLAIMED" ||
      pageState === "TRANSFER_PENDING" ||
      pageState === "PUNISHED_VOUCH";
    const headerRequest = usesWinningRequestHeader
      ? latestWinningRequest
      : latestNonTransferRequest;

    return (
      <Timeline className="mt-4 border-0 pt-0" items={timelineItems}>
        <ProfileTimelineHeaderSection pohId={pohId} request={headerRequest} />
      </Timeline>
    );
  } catch {
    return <ProfileTimelineError />;
  }
}
