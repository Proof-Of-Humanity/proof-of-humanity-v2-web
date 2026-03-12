import {
  SupportedChainId,
  idToChain,
  supportedChains,
} from "config/chains";
import {
  HumanityEventRecord,
  getHumanityEvents,
  getTimelineRequestNode,
} from "data/humanityEvents";
import { getHumanityData } from "data/humanity";
import { RequestQuery } from "generated/graphql";
import { Hash } from "viem";
import { getStatus } from "utils/status";

type CurrentRequest = NonNullable<RequestQuery["request"]>;

const isTransferArtifactRequest = (request: {
  index: number | string;
  status?: {
    id: string;
  } | null;
}) =>
  request.status?.id === "transferred" ||
  request.status?.id === "transferring" ||
  Number(request.index) <= -100;

type TimelineItemKind =
  | "submitted"
  | "inReview"
  | "challenged"
  | "appeal"
  | "verified"
  | "removed"
  | "rejected"
  | "expired"
  | "withdrawn"
  | "transferred"
  | "received";

export interface TimelineItem {
  id: string;
  kind: TimelineItemKind;
  title: string;
  timestamp: number;
  chainId?: SupportedChainId;
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
        event.transferHash?.toLowerCase() === pointer.inTransferHash?.toLowerCase(),
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

  const timelineItems: TimelineItem[] = events.flatMap<TimelineItem>((event) => {
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
    const challengeHref =
      event.disputeId && event.disputeId > 0
        ? `https://klerosboard.com/${event.chainId}/cases/${event.disputeId}`
        : undefined;

    switch (event.type) {
      case "REQUEST_CREATED":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "submitted" as const,
          title:
            event.revocation
              ? "Removal requested"
              : "Profile submitted",
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_ENTERED_REVIEW":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "inReview" as const,
          title: "In review",
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_CHALLENGED":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "challenged" as const,
          title: "Challenged",
          timestamp: event.timestamp,
          chainId: event.chainId,
          externalHref: challengeHref,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_APPEAL_CREATED":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "appeal" as const,
          title: `Appeal round ${event.appealRound ?? ""}`.trim(),
          timestamp: event.timestamp,
          chainId: event.chainId,
          externalHref: challengeHref,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_RESOLVED_ACCEPTED":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: event.revocation ? "removed" : "verified",
          title: event.revocation ? "Removed" : "Verified human",
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_RESOLVED_REJECTED":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "rejected" as const,
          title: "Rejected",
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "REQUEST_WITHDRAWN":
        if (!requestKey || !relevantRequestKeys.has(requestKey)) return [];
        return [{
          id: event.id,
          kind: "withdrawn" as const,
          title: "Withdrawn",
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "TRANSFER_INITIATED":
        if (
          !event.transferHash ||
          !requestKey ||
          !relevantRequestKeys.has(requestKey)
        ) {
          return [];
        }
        const receiveEvent = transferReceiveByHash[event.transferHash.toLowerCase()];
        const destinationChainId =
          receiveEvent?.chainId ??
          supportedChains.find((chain) => chain.id !== event.chainId)?.id;
        return [{
          id: event.id,
          kind: "transferred" as const,
          title: `${receiveEvent ? "Transferred" : "Transferring"
            } profile from ${idToChain(event.chainId)?.name} to ${idToChain(destinationChainId || event.chainId)?.name}`,
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      case "TRANSFER_RECEIVED":
        if (
          !event.transferHash ||
          (!requestRef ||
            !requestKey ||
            !relevantRequestKeys.has(requestKey)) &&
          !initiatedTransferHashes.has(event.transferHash.toLowerCase())
        ) {
          return [];
        }
        return [{
          id: event.id,
          kind: "received" as const,
          title: `Received on ${idToChain(event.chainId)?.name}`,
          timestamp: event.timestamp,
          chainId: event.chainId,
          requestIndex: requestRef?.index,
        }];
      default:
        return [];
    }
  });

  const dedupedTimelineItems = Array.from(
    timelineItems.reduce((acc, item) => {
      const dedupeKey =
        item.chainId !== undefined &&
          item.requestIndex !== undefined &&
          (item.kind === "verified" || item.kind === "removed")
          ? `${item.kind}:${item.chainId}:${item.requestIndex}`
          : item.id;
      const existing = acc.get(dedupeKey);
      if (!existing || item.timestamp > existing.timestamp) {
        acc.set(dedupeKey, item);
      }
      return acc;
    }, new Map<string, TimelineItem>()).values(),
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
    !dedupedTimelineItems.some((item) => item.kind === "expired")
  ) {
    dedupedTimelineItems.push({
      id: `${currentRequest.id}-expired`,
      kind: "expired",
      title: "Expired",
      timestamp: expiredTimestamp,
      chainId: currentRequest.chainId,
      requestIndex: currentRequestIndex,
    });
  }

  return dedupedTimelineItems.sort((itemA, itemB) => itemB.timestamp - itemA.timestamp);
};
export const getRequestTimelineData = async (
  pohId: Hash,
  chainId: SupportedChainId,
  request: CurrentRequest,
  humanityLifespan?: string,
) => {
  const currentRequest: CurrentRequestWithChain = {
    ...request,
    chainId,
  };
  const [humanity, timelineItems] = await Promise.all([
    getHumanityData(pohId),
    createEventTimelineItems(pohId, currentRequest, humanityLifespan),
  ]);

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
    timelineItems,
    requestCounts,
  };
};
