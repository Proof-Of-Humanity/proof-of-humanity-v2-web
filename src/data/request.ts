import {
  SupportedChainId,
  getForeignChain,
  idToChain,
  supportedChains,
  legacyChain,
} from "config/chains";
import { sdk } from "config/subgraph";
import { RequestsQuery } from "generated/graphql";
import { cache } from "react";
import { Address, Hash, concat, keccak256, toHex } from "viem";
import { settleChainQueriesWithStatus } from "./chainQuery";
import { sanitizeHeadRequests } from "./sanitizer";

const emptyRequests = (): RequestsQuery => ({ requests: [] });

export const PROFILES_DISPLAY_REQUIRED_REQS = 12 * 4;

export type RequestStacks = Record<SupportedChainId, RequestsQuery["requests"]>;

export interface RequestStacksResult {
  stacks: RequestStacks;
  failedChainIds: SupportedChainId[];
}

const completeCrossChains = async (out: RequestStacks) => {
  function mergeObjectsWithArrays(obj1: RequestStacks, obj2: RequestStacks) {
    const entries = [...Object.entries(obj1), ...Object.entries(obj2)];
    return entries.reduce((acc: any, [key, value]) => {
      acc[key] = acc[key] ? [...acc[key], ...value] : [...value];
      return acc;
    }, {});
  }
  const humIds = supportedChains.reduce(
    (acc, chain, i) => ({
      ...acc,
      [chain.id]: out[chain.id].map((e) => e.humanity.id),
    }),
    {} as Record<SupportedChainId, RequestsQuery["requests"]>,
  );

  const { values: res, failedChains } = await settleChainQueriesWithStatus(
    (chain) =>
      sdk[chain.id].Requests({
        where: {
          humanity_: { id_in: humIds[getForeignChain(chain.id)] },
        },
        first: PROFILES_DISPLAY_REQUIRED_REQS,
      }),
    emptyRequests,
  );

  const outPlus = supportedChains.reduce(
    (acc, chain, i) => ({
      ...acc,
      [chain.id]:
        chain.id === legacyChain.id
          ? (res[i]?.requests ?? []).filter(
              (r) => !(r.status.id === "vouching" && Number(r.index) <= -1),
            )
          : (res[i]?.requests ?? []),
    }),
    {} as RequestStacks,
  );
  return {
    stacks: mergeObjectsWithArrays(out, outPlus) as RequestStacks,
    failedChainIds: failedChains.map((chain) => chain.id),
  };
};

const _getPagedRequests = async (): Promise<RequestStacksResult> => {
  const { values: res, failedChains } = await settleChainQueriesWithStatus(
    (chain) =>
      sdk[chain.id].Requests({
        first: PROFILES_DISPLAY_REQUIRED_REQS,
      }),
    emptyRequests,
  );
  const out = supportedChains.reduce(
    (acc, chain, i) => ({
      ...acc,
      [chain.id]:
        chain.id === legacyChain.id
          ? (res[i]?.requests ?? []).filter(
              (r) => !(r.status.id === "vouching" && Number(r.index) <= -1),
            )
          : (res[i]?.requests ?? []),
    }),
    {} as RequestStacks,
  );
  const crossChain = await completeCrossChains(out);
  return {
    stacks: crossChain.stacks,
    failedChainIds: [
      ...new Set([
        ...failedChains.map((chain) => chain.id),
        ...crossChain.failedChainIds,
      ]),
    ],
  };
};

/**
 * Fetches one chain's request page. Rejects when the chain's subgraph is
 * unreachable — callers must treat a rejection as "unknown" (outage), never
 * as an empty result.
 */
export const getRequestsLoadingPromises = async (
  chainId: SupportedChainId,
  where: any,
  skipNumber: number,
): Promise<RequestsQuery> => {
  const result = await sdk[chainId].Requests({
    where: {
      ...where,
    },
    first: PROFILES_DISPLAY_REQUIRED_REQS,
    skip: skipNumber,
  });

  // Manually filter out legacy vouching requests (index <= -1) for legacy chain
  if (chainId === legacyChain.id) {
    result.requests = result.requests.filter(
      (r) => !(r.status.id === "vouching" && Number(r.index) <= -1),
    );
  }

  return result;
};

export const getRequestsInitData = async (): Promise<RequestStacksResult> => {
  return await getFilteredRequestsInitData(undefined);
};

export const getFilteredRequestsInitData = async (
  filtered: RequestStacks | undefined,
): Promise<RequestStacksResult> => {
  const { stacks: all, failedChainIds } = await _getPagedRequests();
  const out: RequestStacks = filtered ? filtered : all;
  return { stacks: await sanitizeHeadRequests(all, out), failedChainIds };
};

export const genRequestId = (pohId: Hash, index: number) => {
  return keccak256(
    concat([
      pohId,
      index >= 0
        ? toHex(index, { size: 32 })
        : index <= -100
          ? concat([
              toHex(Math.abs(index), { size: 32 }),
              toHex("bridged", { size: 7 }),
            ])
          : concat([
              toHex(Math.abs(index + 1), { size: 32 }),
              toHex("legacy", { size: 6 }),
            ]),
    ]),
  );
};

export interface OffChainVouch {
  voucher: Address;
  expiration: number;
  signature: Hash;
  create_at: string;
}

/**
 * @notice Fetches the request-page subgraph payload.
 * @dev The `Request` query already includes `humanity.winnerClaim`, which is
 * the identity source used by the request page. Rejects when the chain's
 * subgraph is unreachable so callers can distinguish an outage (rejection)
 * from a request that does not exist (`null`).
 */
export const getRequestPageData = cache(
  async (chainId: SupportedChainId, pohId: Hash, index: number) =>
    (
      await sdk[chainId]["Request"]({
        id: genRequestId(pohId, index),
        humanityId: pohId,
      })
    ).request,
);

export const getHistoricalWinnerClaim = cache(
  async (pohId: Hash, lastStatusChange: string | number) => {
    const results = await Promise.allSettled(
      supportedChains.map((chain) =>
        sdk[chain.id].HistoricalWinnerClaim({
          humanityId: pohId,
          lastStatusChange: String(lastStatusChange),
        }),
      ),
    );
    const requests = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value.requests : [],
    );

    return (
      requests.sort(
        (requestA, requestB) =>
          Number(requestB.lastStatusChange) - Number(requestA.lastStatusChange),
      )[0] ?? null
    );
  },
);

export const getOffChainVouches = async (
  chainId: SupportedChainId,
  claimer: Address,
  pohId: Hash,
) => {
  if (!idToChain(chainId)) {
    return [];
  }

  try {
    const response = await fetch(
      `https://testnets--proof-of-humanity-v2.netlify.app/api/vouch/${chainId}/for-request/${claimer}/${pohId}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return Array.isArray(payload) ? (payload as OffChainVouch[]) : [];
  } catch {
    return [];
  }
};
