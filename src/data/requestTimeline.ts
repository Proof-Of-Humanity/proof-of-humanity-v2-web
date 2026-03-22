import { SupportedChainId, idToChain, supportedChains } from "config/chains";
import {
  HumanityEventRecord,
  getHumanityEvents,
  getTimelineRequestNode,
} from "data/humanityEvents";
import { getHumanityData } from "data/humanity";
import { OffChainVouch } from "data/request";
import { HumanityQuery, RequestQuery } from "generated/graphql";
import { Hash } from "viem";
import { prettifyId } from "utils/identifier";
import { getStatus, RequestStatus } from "utils/status";

type CurrentRequest = NonNullable<RequestQuery["request"]>;
type ProfileRequest = ArrayElement<
  NonNullable<HumanityQuery["humanity"]>["requests"]
>;
type RequestWithChain = ProfileRequest & {
  chainId: SupportedChainId;
  requestStatus?: RequestStatus;
};

const isTransferArtifactRequest = (request: {
  index: number | string;
  status?: {
    id: string;
  } | null;
}) =>
  request.status?.id === "transferred" || request.status?.id === "transferring";

type TimelineItemKind =
  | "submitted"
  | "inReview"
  | "vouchRemoved"
  | "challenged"
  | "appeal"
  | "verified"
  | "removed"
  | "rejected"
  | "expired"
  | "withdrawn"
  | "transferred"
  | "received"
  | "vouchReceived";

export interface TimelineItem {
  id: string;
  kind: TimelineItemKind;
  title: string;
  timestamp: number;
  chainId?: SupportedChainId;
  href?: string;
  externalHref?: string;
  requestIndex?: number;
}

interface CurrentRequestWithChain extends CurrentRequest {
  chainId: SupportedChainId;
}

interface LineageRequestNode {
  chainId: SupportedChainId;
  index: number;
  inTransferHash?: Hash | null;
}

const truncatePohId = (id: Hash) => {
  const formattedId = prettifyId(id);
  return `0x${formattedId.slice(0, 2)}...${formattedId.slice(-4)}`;
};

const getProfileRequestTimelineItem = (
  pohId: Hash,
  request: RequestWithChain,
): TimelineItem | null => {
  const requestTimelineId = `${request.chainId}:${request.id}`;
  const requestHref = `/${prettifyId(pohId)}/${idToChain(
    request.chainId,
  )?.name.toLowerCase()}/${Number(request.index)}`;
  const requestStatus =
    request.requestStatus ??
    getStatus({
      status: request.status,
      revocation: request.revocation,
      winnerParty: request.winnerParty,
      index: Number(request.index),
      creationTime: request.creationTime,
      expirationTime: request.expirationTime,
    });

  switch (requestStatus) {
    case RequestStatus.VOUCHING:
      return {
        id: requestTimelineId,
        kind: "submitted",
        title: request.revocation ? "Removal requested" : "Profile submitted",
        timestamp: Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.PENDING_CLAIM:
      return {
        id: requestTimelineId,
        kind: "inReview",
        title: "In review",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.PENDING_REVOCATION:
      return {
        id: requestTimelineId,
        kind: "submitted",
        title: "Removal requested",
        timestamp: Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.DISPUTED_CLAIM:
    case RequestStatus.DISPUTED_REVOCATION:
      return {
        id: requestTimelineId,
        kind: "challenged",
        title: "Challenged",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.RESOLVED_CLAIM:
      return {
        id: requestTimelineId,
        kind: "verified",
        title: "Verified human",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.RESOLVED_REVOCATION:
      return {
        id: requestTimelineId,
        kind: "removed",
        title: "Removed",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.REJECTED:
      return {
        id: requestTimelineId,
        kind: "rejected",
        title: "Rejected",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.WITHDRAWN:
      return {
        id: requestTimelineId,
        kind: "withdrawn",
        title: "Withdrawn",
        timestamp:
          Number(request.lastStatusChange) || Number(request.creationTime),
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    case RequestStatus.EXPIRED: {
      const timestamp = Number(request.expirationTime);
      if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
      return {
        id: `${requestTimelineId}-expired`,
        kind: "expired",
        title: "Expired",
        timestamp,
        chainId: request.chainId,
        href: requestHref,
        requestIndex: Number(request.index),
      };
    }
    default:
      return null;
  }
};

const createEventTimelineItems = async (
  pohId: Hash,
  currentRequest: CurrentRequestWithChain,
  humanityLifespan?: string,
): Promise<TimelineItem[]> => {
  const events = await getHumanityEvents(pohId);
  if (!events.length) return [];

  const currentNode: LineageRequestNode = {
    chainId: currentRequest.chainId,
    index: Number(currentRequest.index),
    inTransferHash: currentRequest.inTransferHash,
  };

  const lineage: LineageRequestNode[] = [currentNode];
  let pointer = currentNode;

  // Walk back synthetic transfer hops until reaching the originating real request.
  while (pointer.index <= -100 && !!pointer.inTransferHash) {
    const matchingTransfer = events.find(
      (event) =>
        event.type === "TRANSFER_INITIATED" &&
        event.transferHash?.toLowerCase() ===
          pointer.inTransferHash?.toLowerCase(),
    );
    const parentRequestIndex = matchingTransfer?.requestIndex;
    const parentChainId = matchingTransfer?.chainId;
    if (
      parentRequestIndex === null ||
      parentRequestIndex === undefined ||
      parentChainId === null ||
      parentChainId === undefined
    ) {
      break;
    }

    const parentNode = await getTimelineRequestNode(
      parentChainId,
      pohId,
      parentRequestIndex,
    );
    if (!parentNode) break;

    lineage.unshift(parentNode);
    pointer = parentNode;
  }

  const relevantRequestKeys = new Set(
    lineage.map((request) => `${request.chainId}:${request.index}`),
  );
  const initiatedTransferHashes = new Set(
    events
      .filter(
        (event) =>
          event.type === "TRANSFER_INITIATED" &&
          !!event.transferHash &&
          event.requestIndex !== null &&
          event.requestIndex !== undefined &&
          relevantRequestKeys.has(`${event.chainId}:${event.requestIndex}`),
      )
      .map((event) => event.transferHash!.toLowerCase()),
  );

  const transferReceiveByHash = events.reduce(
    (acc, event) => {
      if (event.type === "TRANSFER_RECEIVED" && event.transferHash) {
        acc[event.transferHash.toLowerCase()] = event;
      }
      return acc;
    },
    {} as Record<string, HumanityEventRecord>,
  );

  const timelineItems: TimelineItem[] = events.flatMap<TimelineItem>(
    (event) => {
      const requestRef =
        event.requestIndex !== null && event.requestIndex !== undefined
          ? {
              chainId: event.chainId,
              index: event.requestIndex,
            }
          : null;
      const requestKey =
        requestRef !== null
          ? `${requestRef.chainId}:${requestRef.index}`
          : null;
      const isRelevantRequestEvent =
        !!requestKey && relevantRequestKeys.has(requestKey);
      const challengeHref =
        event.disputeId && event.disputeId > 0
          ? `https://klerosboard.com/${event.chainId}/cases/${event.disputeId}`
          : undefined;
      const toTimelineItem = (
        item: Omit<
          TimelineItem,
          "id" | "timestamp" | "chainId" | "requestIndex"
        >,
      ): TimelineItem => ({
        id: event.id,
        timestamp: event.timestamp,
        chainId: event.chainId,
        requestIndex: requestRef?.index,
        ...item,
      });

      switch (event.type) {
        case "REQUEST_CREATED":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "submitted",
              title: event.revocation
                ? "Removal requested"
                : "Profile submitted",
            }),
          ];
        case "REQUEST_ENTERED_REVIEW":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "inReview",
              title: "In review",
            }),
          ];
        case "REQUEST_VOUCH_ADDED":
          if (!isRelevantRequestEvent || !event.voucher) return [];
          return [
            toTimelineItem({
              kind: "vouchReceived",
              title: `Received vouch from ${truncatePohId(event.voucher)}`,
              href: `/${prettifyId(event.voucher)}`,
            }),
          ];
        case "REQUEST_VOUCH_REMOVED":
          if (!isRelevantRequestEvent || !event.voucher) return [];
          return [
            toTimelineItem({
              kind: "vouchRemoved",
              title: `Removed vouch from ${truncatePohId(event.voucher)}`,
              href: `/${prettifyId(event.voucher)}`,
            }),
          ];
        case "REQUEST_CHALLENGED":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "challenged",
              title: "Challenged",
              externalHref: challengeHref,
            }),
          ];
        case "REQUEST_APPEAL_CREATED":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "appeal",
              title: `Appeal round ${event.appealRound ?? ""}`.trim(),
              externalHref: challengeHref,
            }),
          ];
        case "REQUEST_RESOLVED_ACCEPTED":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: event.revocation ? "removed" : "verified",
              title: event.revocation ? "Removed" : "Verified human",
            }),
          ];
        case "REQUEST_RESOLVED_REJECTED":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "rejected",
              title: "Rejected",
            }),
          ];
        case "REQUEST_WITHDRAWN":
          if (!isRelevantRequestEvent) return [];
          return [
            toTimelineItem({
              kind: "withdrawn",
              title: "Withdrawn",
            }),
          ];
        case "TRANSFER_INITIATED":
          if (!event.transferHash) {
            return [];
          }
          if (!isRelevantRequestEvent) return [];
          const receiveEvent =
            transferReceiveByHash[event.transferHash.toLowerCase()];
          const destinationChainId =
            receiveEvent?.chainId ??
            supportedChains.find((chain) => chain.id !== event.chainId)?.id;
          return [
            toTimelineItem({
              kind: "transferred",
              title: `${
                receiveEvent ? "Transferred" : "Transferring"
              } profile from ${idToChain(event.chainId)?.name} to ${idToChain(destinationChainId || event.chainId)?.name}`,
            }),
          ];
        case "TRANSFER_RECEIVED":
          if (
            !event.transferHash ||
            !initiatedTransferHashes.has(event.transferHash.toLowerCase())
          ) {
            return [];
          }
          return [
            toTimelineItem({
              kind: "received",
              title: `Received on ${idToChain(event.chainId)?.name}`,
            }),
          ];
        default:
          return [];
      }
    },
  );

  const currentRequestIndex = Number(currentRequest.index);
  const currentRequestStatus = getStatus(
    {
      status: currentRequest.status,
      revocation: currentRequest.revocation,
      winnerParty: currentRequest.winnerParty,
      index: currentRequestIndex,
      creationTime: currentRequest.creationTime,
      expirationTime: currentRequest.expirationTime,
    },
    { humanityLifespan },
  );
  const expiredTimestamp = Number(currentRequest.expirationTime);

  if (
    currentRequestStatus === "EXPIRED" &&
    Number.isFinite(expiredTimestamp) &&
    expiredTimestamp > 0 &&
    !timelineItems.some((item) => item.kind === "expired")
  ) {
    timelineItems.push({
      id: `${currentRequest.id}-expired`,
      kind: "expired",
      title: "Expired",
      timestamp: expiredTimestamp,
      chainId: currentRequest.chainId,
      requestIndex: currentRequestIndex,
    });
  }

  return timelineItems.sort(
    (itemA, itemB) => itemB.timestamp - itemA.timestamp,
  );
};

const createOffChainVouchTimelineItems = async (
  currentRequest: CurrentRequestWithChain,
  offChainVouches: OffChainVouch[],
  eventTimelineItems: TimelineItem[],
): Promise<TimelineItem[]> => {
  const hasEventBackedVouchMilestones = eventTimelineItems.some(
    (item) =>
      (item.kind === "vouchReceived" || item.kind === "vouchRemoved") &&
      item.requestIndex === Number(currentRequest.index),
  );

  if (hasEventBackedVouchMilestones) return [];

  return offChainVouches.flatMap((vouch) => {
    const timestamp = Math.floor(new Date(vouch.create_at).getTime() / 1000);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return [];
    return [
      {
        id: `offchain-vouch:${currentRequest.chainId}:${currentRequest.index}:${vouch.signature}`,
        kind: "vouchReceived" as const,
        title: `Received vouch from ${truncatePohId(vouch.voucher as Hash)}`,
        timestamp,
        chainId: currentRequest.chainId,
        href: `/${prettifyId(vouch.voucher as Hash)}`,
        requestIndex: Number(currentRequest.index),
      },
    ];
  });
};

export const getRequestTimelineData = async (
  pohId: Hash,
  chainId: SupportedChainId,
  request: CurrentRequest,
  offChainVouches: OffChainVouch[],
  humanityLifespan?: string,
) => {
  const currentRequest: CurrentRequestWithChain = {
    ...request,
    chainId,
  };
  const [humanity, eventTimelineItems] = await Promise.all([
    getHumanityData(pohId),
    createEventTimelineItems(pohId, currentRequest, humanityLifespan),
  ]);
  const resolvedOffChainVouchTimelineItems =
    await createOffChainVouchTimelineItems(
      currentRequest,
      offChainVouches,
      eventTimelineItems,
    );
  const requestCounts = supportedChains.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.id]: (humanity[chain.id].humanity?.requests ?? []).filter(
        (request) => !isTransferArtifactRequest(request),
      ).length,
    }),
    {} as Record<SupportedChainId, number>,
  );

  return {
    timelineItems: [
      ...eventTimelineItems,
      ...resolvedOffChainVouchTimelineItems,
    ].sort((itemA, itemB) => itemB.timestamp - itemA.timestamp),
    requestCounts,
  };
};

export const getProfileTimelineData = async (
  pohId: Hash,
  requests: RequestWithChain[],
) => {
  const requestTimelineItems = requests
    .filter((request) => !isTransferArtifactRequest(request))
    .map((request) => getProfileRequestTimelineItem(pohId, request))
    .filter((item): item is TimelineItem => !!item);

  return {
    timelineItems: requestTimelineItems.sort(
      (itemA, itemB) => itemB.timestamp - itemA.timestamp,
    ),
  };
};
