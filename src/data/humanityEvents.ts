import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import {
  HumanityEventType,
  HumanityEventsQuery,
  RequestTimelineNodeQuery,
} from "generated/graphql";
import { cache } from "react";
import { Hash } from "viem";
import { genRequestId } from "./request";

export interface HumanityEventRecord {
  id: string;
  chainId: SupportedChainId;
  timestamp: number;
  type: HumanityEventType;
  requestIndex?: number | null;
  transferHash?: Hash | null;
  voucher?: Hash | null;
  disputeId?: number | null;
  appealRound?: number | null;
  revocation?: boolean | null;
}

export interface TimelineRequestNode {
  chainId: SupportedChainId;
  index: number;
  inTransferHash?: Hash | null;
}

const toOptionalNumber = (value?: string | null) =>
  value !== null && value !== undefined ? Number(value) : null;

const toHumanityEventRecord = (
  chainId: SupportedChainId,
  event: HumanityEventsQuery["humanityEvents"][number],
): HumanityEventRecord => ({
  id: event.id,
  chainId,
  timestamp: Number(event.timestamp),
  type: event.type,
  requestIndex: toOptionalNumber(event.requestIndex),
  transferHash: event.transferHash,
  voucher: event.voucher,
  disputeId: toOptionalNumber(event.disputeId),
  appealRound: toOptionalNumber(event.appealRound),
  revocation: event.revocation,
});

const toTimelineRequestNode = (
  chainId: SupportedChainId,
  request: NonNullable<RequestTimelineNodeQuery["request"]>,
): TimelineRequestNode => ({
  chainId,
  index: Number(request.index),
  inTransferHash: request.inTransferHash,
});

const getHumanityEventsForChain = async (
  chainId: SupportedChainId,
  humanityId: Hash,
) => {
  try {
    const response = await sdk[chainId].HumanityEvents({ humanityId });

    return response.humanityEvents.map((event) =>
      toHumanityEventRecord(chainId, event),
    );
  } catch {
    return [] as HumanityEventRecord[];
  }
};

export const getHumanityEvents = cache(async (humanityId: Hash) => {
  const results = await Promise.all(
    supportedChains.map((chain) => getHumanityEventsForChain(chain.id, humanityId)),
  );

  return results
    .flat()
    .sort((eventA, eventB) => eventA.timestamp - eventB.timestamp);
});

export const getTimelineRequestNode = cache(async (
  chainId: SupportedChainId,
  humanityId: Hash,
  index: number,
) => {
  try {
    const response = await sdk[chainId].RequestTimelineNode({
      id: genRequestId(humanityId, index),
    });

    if (!response.request) return null;

    return toTimelineRequestNode(chainId, response.request);
  } catch {
    return null;
  }
});
