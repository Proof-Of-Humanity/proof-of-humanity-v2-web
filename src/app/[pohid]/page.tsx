import Image from "next/image";
import { Suspense } from "react";
import { machinifyId, prettifyId } from "utils/identifier";
import { TimelineHistorySectionSkeleton } from "./[chain]/[request]/TimelineSection";
import ProfileActionsLoading from "./ProfileActionsLoading";
import ProfileActionsSection from "./ProfileActionsSection";
import ProfileSummaryLoading from "./ProfileSummaryLoading";
import ProfileSummarySection from "./ProfileSummarySection";
import ProfileTimelineSection from "./ProfileTimelineSection";

interface PageProps {
  params: { pohid: string };
}

async function Profile({ params: { pohid } }: PageProps) {
  const pohId = machinifyId(pohid);

  if (!pohId) return <>Not found</>;

  return (
    <div className="content">
      <div className="paper relative mt-24 flex flex-col items-center pt-20">
        <div className="bordered absolute -top-16 left-1/2 -translate-x-1/2 rounded-full shadow">
          <div className="bg-whiteBackground h-32 w-32 rounded-full px-6 pt-5">
            <Image
              alt="poh id"
              src="/logo/pohid.svg"
              height={128}
              width={128}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">POH ID</span>
          <span className="mb-12 text-center text-xl font-semibold">
            {prettifyId(pohId).slice(0, 20)}
            <wbr />
            {prettifyId(pohId).slice(20)}
          </span>
        </div>

        <Suspense fallback={<ProfileSummaryLoading />}>
          <ProfileSummarySection pohId={pohId} />
        </Suspense>

        <Suspense fallback={<ProfileActionsLoading />}>
          <ProfileActionsSection pohId={pohId} />
        </Suspense>
      </div>

      <Suspense fallback={<TimelineHistorySectionSkeleton />}>
        <ProfileTimelineSection pohId={pohId} />
      </Suspense>
    </div>
  );
}

export default Profile;
