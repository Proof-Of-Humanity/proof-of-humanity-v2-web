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
import { OffChainVouch } from "data/request";
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
  | "received"
  | "vouchReceived";

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
    const isRelevantRequestEvent =
      !!requestKey && relevantRequestKeys.has(requestKey);
    const challengeHref =
      event.disputeId && event.disputeId > 0
        ? `https://klerosboard.com/${event.chainId}/cases/${event.disputeId}`
        : undefined;
    const toTimelineItem = (
      item: Omit<TimelineItem, "id" | "timestamp" | "chainId" | "requestIndex">,
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
        return [toTimelineItem({
          kind: "submitted",
          title:
            event.revocation
              ? "Removal requested"
              : "Profile submitted",
        })];
      case "REQUEST_ENTERED_REVIEW":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: "inReview",
          title: "In review",
        })];
      case "REQUEST_CHALLENGED":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: "challenged",
          title: "Challenged",
          externalHref: challengeHref,
        })];
      case "REQUEST_APPEAL_CREATED":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: "appeal",
          title: `Appeal round ${event.appealRound ?? ""}`.trim(),
          externalHref: challengeHref,
        })];
      case "REQUEST_RESOLVED_ACCEPTED":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: event.revocation ? "removed" : "verified",
          title: event.revocation ? "Removed" : "Verified human",
        })];
      case "REQUEST_RESOLVED_REJECTED":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: "rejected",
          title: "Rejected",
        })];
      case "REQUEST_WITHDRAWN":
        if (!isRelevantRequestEvent) return [];
        return [toTimelineItem({
          kind: "withdrawn",
          title: "Withdrawn",
        })];
      case "TRANSFER_INITIATED":
        if (!event.transferHash) {
          return [];
        }
        if (!isRelevantRequestEvent) return [];
        const receiveEvent = transferReceiveByHash[event.transferHash.toLowerCase()];
        const destinationChainId =
          receiveEvent?.chainId ??
          supportedChains.find((chain) => chain.id !== event.chainId)?.id;
        return [toTimelineItem({
          kind: "transferred",
          title: `${receiveEvent ? "Transferred" : "Transferring"
            } profile from ${idToChain(event.chainId)?.name} to ${idToChain(destinationChainId || event.chainId)?.name}`,
        })];
      case "TRANSFER_RECEIVED":
        if (
          !event.transferHash ||
          !initiatedTransferHashes.has(event.transferHash.toLowerCase())
        ) {
          return [];
        }
        return [toTimelineItem({
          kind: "received",
          title: `Received on ${idToChain(event.chainId)?.name}`,
        })];
      default:
        return [];
    }
  });

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

  return timelineItems.sort((itemA, itemB) => itemB.timestamp - itemA.timestamp);
};

const createOffChainVouchTimelineItems = async (
  currentRequest: CurrentRequestWithChain,
  offChainVouches: OffChainVouch[],
): Promise<TimelineItem[]> => {
  if (currentRequest.status.id !== "vouching") return [];
  console.log({ offChainVouches });
  return offChainVouches.flatMap((vouch) => {
    const timestamp = Math.floor(new Date(vouch.createdAt).getTime() / 1000);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return [];
    console.log({ timestamp });
    return [{
      id: `offchain-vouch:${currentRequest.chainId}:${currentRequest.index}:${vouch.signature}`,
      kind: "vouchReceived" as const,
      title: "Received vouch",
      timestamp,
      chainId: currentRequest.chainId,
      requestIndex: Number(currentRequest.index),
    }];
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
  const [humanity, eventTimelineItems, offChainVouchTimelineItems] = await Promise.all([
    getHumanityData(pohId),
    createEventTimelineItems(pohId, currentRequest, humanityLifespan),
    createOffChainVouchTimelineItems(currentRequest, offChainVouches),
  ]);

  console.log({ offChainVouchTimelineItems });
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
    timelineItems: [...eventTimelineItems, ...offChainVouchTimelineItems].sort(
      (itemA, itemB) => itemB.timestamp - itemA.timestamp,
    ),
    requestCounts,
  };
};
