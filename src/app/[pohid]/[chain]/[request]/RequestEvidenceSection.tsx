import { Suspense } from "react";
import { getEvidenceSubmitterProfiles } from "data/evidence";
import { RequestOptimisticProvider } from "optimistic/request";
import type { RequestOptimisticBase } from "optimistic/types";
import type { Address } from "viem";
import Evidence from "./Evidence";
import type {
  RequestEvidenceSource,
  RequestPageRequest,
} from "./RequestIdentityCard.types";

function EvidenceSectionSkeleton() {
  return (
    <div className="bg-grey min-h-20 w-full animate-pulse rounded-[22px]" />
  );
}

/**
 * @notice Resolves the submitter → profile map, then renders the evidence list.
 * @dev Split out so the (potentially slow) cross-chain profile lookup suspends
 * behind a skeleton instead of blocking the whole evidence section from
 * painting. Profiles only decide internal-profile vs explorer links per item.
 */
async function EvidenceWithProfiles({
  pohId,
  requestIndex,
  submitters,
}: {
  pohId: `0x${string}`;
  requestIndex: number;
  submitters: Address[];
}) {
  const startedAt = Date.now();
  console.info(
    "[request-debug]",
    JSON.stringify({
      event: "evidence-profiles-start",
      pohId,
      requestIndex,
      submitterCount: new Set(submitters.map((item) => item.toLowerCase()))
        .size,
    }),
  );
  const submitterProfiles = await getEvidenceSubmitterProfiles(submitters);
  console.info(
    "[request-debug]",
    JSON.stringify({
      event: "evidence-profiles-done",
      pohId,
      requestIndex,
      profileCount: Object.keys(submitterProfiles).length,
      durationMs: Date.now() - startedAt,
    }),
  );

  return (
    <Evidence
      pohId={pohId}
      requestIndex={requestIndex}
      submitterProfiles={submitterProfiles}
    />
  );
}

/**
 * @notice Resolves and renders the request evidence section.
 * @dev The caller chooses whether this is current-request evidence or
 * historical identity evidence. The nested optimistic provider only overrides
 * `evidenceList` and reuses the parent optimistic state.
 */
export default function RequestEvidenceSection({
  evidenceSource,
  optimisticBase,
  pohId,
  request,
}: {
  evidenceSource: RequestEvidenceSource;
  optimisticBase: RequestOptimisticBase;
  pohId: `0x${string}`;
  request: RequestPageRequest;
}) {
  const evidenceList = evidenceSource.evidence.map((item, index) => ({
    id: "id" in item && item.id ? item.id : `${request.id}-evidence-${index}`,
    uri: item.uri,
    creationTime: Number(
      ("creationTime" in item ? item.creationTime : undefined) ||
        request.lastStatusChange ||
        request.creationTime,
    ),
    submitter: (("submitter" in item ? item.submitter : undefined) ||
      evidenceSource.requester) as Address,
  }));

  return (
    <RequestOptimisticProvider
      base={{
        ...optimisticBase,
        evidenceList,
      }}
    >
      <Suspense fallback={<EvidenceSectionSkeleton />}>
        <EvidenceWithProfiles
          pohId={pohId}
          requestIndex={request.index}
          submitters={evidenceList.map((item) => item.submitter)}
        />
      </Suspense>
    </RequestOptimisticProvider>
  );
}
