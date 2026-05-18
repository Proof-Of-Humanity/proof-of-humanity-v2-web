import { SupportedChainId } from "config/chains";
import type { HumanityEventRecord } from "data/humanityEvents";
import { getRequestDataRaw } from "data/request";
import { sdk } from "config/subgraph";
import { cache } from "react";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";
import { Address } from "viem";
import type {
  IdentityEvidence,
  IdentitySourceRequest,
  RequestIdentityViewData,
  RequestPageRequest,
} from "app/[pohid]/[chain]/[request]/RequestIdentityCard.types";

type RequestIdentity = Pick<
  IdentitySourceRequest,
  "claimer" | "evidenceGroup" | "requester"
>;

/**
 * @notice Returns the original evidence URI from a request evidence list.
 * @dev Full request evidence lists are queried newest-first, so the original
 * registration or request evidence is the last item in those lists.
 */
const getInitialEvidenceUri = (evidence: IdentityEvidence[]) =>
  evidence.at(-1)?.uri ?? null;

/**
 * @notice Resolves the original identity request behind a transfer-derived request.
 * @dev Starts from the caller-provided raw request and walks backward through
 * `TRANSFER_INITIATED` events until it reaches the non-synthetic source request.
 */
const resolveSourceRequest = async ({
  humanityEvents,
  pohId,
  seed,
}: {
  humanityEvents: HumanityEventRecord[];
  pohId: `0x${string}`;
  seed: IdentitySourceRequest;
}): Promise<IdentitySourceRequest> => {
  let currentChainId = seed.chainId;
  let currentRequest = seed;

  while (
    Number(currentRequest.index) <= -100 &&
    currentRequest.inTransferHash
  ) {
    const parentTransfer = humanityEvents.find(
      (event) =>
        event.type === "TRANSFER_INITIATED" &&
        event.transferHash?.toLowerCase() ===
          currentRequest.inTransferHash?.toLowerCase(),
    );

    if (
      !parentTransfer ||
      parentTransfer.requestIndex === null ||
      parentTransfer.requestIndex === undefined
    ) {
      break;
    }

    const parentRequest = await getRequestDataRaw(
      parentTransfer.chainId,
      pohId,
      parentTransfer.requestIndex,
    );

    if (!parentRequest) break;

    currentChainId = parentTransfer.chainId;
    currentRequest = { ...parentRequest, chainId: currentChainId };
  }

  return { ...currentRequest, chainId: currentChainId };
};

/**
 * @notice Fetches the latest prior winning identity request on the request chain.
 * @dev Revocations can only be created where the humanity is active; if that
 * active identity was transferred in, the returned synthetic transfer request
 * is resolved by `resolveSourceRequest`.
 */
const getLatestWinningIdentityRequest = async ({
  chainId,
  pohId,
  latestBefore,
}: {
  chainId: SupportedChainId;
  pohId: `0x${string}`;
  latestBefore: number;
}) => {
  const response = await sdk[chainId].LatestIdentityRequest({
    humanityId: pohId,
    latestBefore,
  });

  const request = response.requests[0];
  return request ? { ...request, chainId } : null;
};

/**
 * @notice Selects the request whose identity should be displayed on the page.
 * @dev Revocations display the latest prior winning identity request, while
 * transfer requests are resolved back to their source identity request.
 */
const getRequestIdentity = async ({
  humanityEvents,
  pohId,
  chainId,
  request,
}: {
  humanityEvents: HumanityEventRecord[];
  pohId: `0x${string}`;
  chainId: SupportedChainId;
  request: RequestPageRequest;
}): Promise<RequestIdentity> => {
  let identitySourceSeed: IdentitySourceRequest = { ...request, chainId };

  if (request.revocation) {
    const requestTimestamp = Number(
      request.lastStatusChange || request.creationTime || 0,
    );
    const latestWinningIdentityRequest = await getLatestWinningIdentityRequest({
      chainId,
      pohId,
      latestBefore: requestTimestamp,
    });

    if (latestWinningIdentityRequest) {
      identitySourceSeed = latestWinningIdentityRequest;
    }
  }

  const identitySource = await resolveSourceRequest({
    humanityEvents,
    pohId,
    seed: identitySourceSeed,
  });

  return {
    claimer: identitySource.claimer,
    evidenceGroup: identitySource.evidenceGroup,
    requester: identitySource.requester,
  };
};

/**
 * @notice Starts the registration and revocation file fetches needed by identity UI.
 * @dev Registration media always comes from the resolved identity request.
 * Revocations also load the current request evidence for the revocation banner.
 * The returned promises let each UI section await only the file it renders.
 */
const getIdentityFiles = ({
  identity,
  request,
}: {
  identity: RequestIdentity;
  request: RequestPageRequest;
}) => {
  const registrationEvidenceUri = getInitialEvidenceUri(
    identity.evidenceGroup.evidence,
  );
  const revocationEvidenceUri = request.revocation
    ? getInitialEvidenceUri(request.evidenceGroup.evidence)
    : null;
  const registrationEvidencePromise = registrationEvidenceUri
    ? ipfsFetch<EvidenceFile>(registrationEvidenceUri)
    : Promise.resolve(null);

  return {
    registrationFilePromise: registrationEvidencePromise.then(
      (registrationEvidence) =>
        registrationEvidence?.fileURI
          ? ipfsFetch<RegistrationFile>(registrationEvidence.fileURI)
          : null,
    ),
    revocationFilePromise: revocationEvidenceUri
      ? ipfsFetch<EvidenceFile>(revocationEvidenceUri)
      : Promise.resolve(null),
  };
};

/**
 * @notice Builds all identity-derived data with request-level React caching.
 * @dev Returns only the UI data needed by the identity card.
 */
export const getRequestIdentityViewData = cache(
  async (
    chainId: SupportedChainId,
    humanityEventsPromise: Promise<HumanityEventRecord[]>,
    pohId: `0x${string}`,
    request: RequestPageRequest,
  ): Promise<RequestIdentityViewData> => {
    const humanityEvents = await humanityEventsPromise;
    const identity = await getRequestIdentity({
      humanityEvents,
      pohId,
      chainId,
      request,
    });

    const { registrationFilePromise, revocationFilePromise } = getIdentityFiles(
      {
        identity,
        request,
      },
    );

    const identityClaimerName = identity.claimer.name || "";
    const displayedClaimerId = identity.claimer.id as Address;

    return {
      displayedClaimerId,
      identityClaimerName,
      registrationFilePromise,
      revocationFilePromise,
    };
  },
);

export { getRequestIdentity };
