import { RequestOptimisticProvider } from "optimistic/request";
import type { RequestOptimisticBase } from "optimistic/types";
import type { Address } from "viem";
import Evidence from "./Evidence";
import type {
  RequestEvidenceSource,
  RequestPageRequest,
} from "./RequestIdentityCard.types";

/**
 * @notice Resolves and renders the request evidence section.
 * @dev The caller chooses whether this is current-request evidence or
 * historical identity evidence. The nested optimistic provider only overrides
 * `evidenceList` and reuses the parent optimistic state.
 */
export default async function RequestEvidenceSection({
  arbitrationInfo,
  evidenceSource,
  optimisticBase,
  pohId,
  request,
}: {
  arbitrationInfo: RequestPageRequest["arbitratorHistory"];
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
      <Evidence
        pohId={pohId}
        requestIndex={request.index}
        arbitrationInfo={arbitrationInfo}
      />
    </RequestOptimisticProvider>
  );
}
