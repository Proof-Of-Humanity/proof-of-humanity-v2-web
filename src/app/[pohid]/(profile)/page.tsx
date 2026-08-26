import Image from "next/image";
import { Suspense } from "react";
import CopyButton from "components/CopyButton";
import { machinifyId, prettifyId } from "utils/identifier";
import { TimelineHistorySectionSkeleton } from "../[chain]/[request]/TimelineSection";
import ProfileActionsLoading from "../ProfileActionsLoading";
import ProfileActionsSection from "../ProfileActionsSection";
import ProfileSummaryLoading from "../ProfileSummaryLoading";
import ProfileSummarySection from "../ProfileSummarySection";
import ProfileTimelineSection from "../ProfileTimelineSection";

interface PageProps {
  params: Promise<{ pohid: string }>;
}

async function Profile({ params }: PageProps) {
  const { pohid } = await params;
  const pohId = machinifyId(pohid);

  if (!pohId) return <>Not found</>;

  const displayId = prettifyId(pohId);

  return (
    <div className="content max-w-[1156px]">
      <div className="paper relative mt-24 flex flex-col items-center px-2 pb-6 pt-20 sm:px-8">
        <div className="bg-whiteBackground absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full shadow">
          <Image
            alt="poh id"
            src="/logo/pohid-badge.svg"
            height={128}
            width={128}
            className="h-32 w-32"
          />
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <h1 className="text-primaryText text-2xl font-semibold">POH ID</h1>
          <p className="max-w-[calc(100vw-7rem)] break-all px-2 text-center text-sm leading-5 text-peach sm:max-w-none">
            {displayId}
            <CopyButton
              value={displayId}
              label="Copy POH ID"
              className="ml-1 align-middle"
            />
          </p>
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
