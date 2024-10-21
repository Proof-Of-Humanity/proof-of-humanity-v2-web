import { cache } from 'react';
import { SupportedChainId, getForeignChain, supportedChains } from 'config/chains';
import { REQUESTS_DISPLAY_BATCH } from 'config/misc';
import { sdk } from 'config/subgraph';
import { RequestsQuery } from 'generated/graphql';
import { Address, Hash, concat, keccak256, toHex } from 'viem';
import axios from 'axios';
import { sanitizeHeadRequests, sanitizeRequest } from './sanitizer';

const PROFILES_DISPLAY_REQUIRED_REQS = REQUESTS_DISPLAY_BATCH * 4;

const completeCrossChains = async (out: Record<SupportedChainId, RequestsQuery['requests']>) => {
  function mergeObjectsWithArrays(
    obj1: Record<SupportedChainId, RequestsQuery['requests']>,
    obj2: Record<SupportedChainId, RequestsQuery['requests']>,
  ) {
    const entries = [...Object.entries(obj1), ...Object.entries(obj2)];
    return entries.reduce((acc: any, [key, value]) => {
      acc[key] = acc[key] ? [...acc[key], ...value] : [...value];
      return acc;
    }, {});
  }
  const humIds = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: out[chain.id].map((e) => e.humanity.id) }),
    {} as Record<SupportedChainId, RequestsQuery['requests']>,
  );

  const res = await Promise.all(
    supportedChains.map((chain) =>
      sdk[chain.id].Requests({
        where: { humanity_: { id_in: humIds[getForeignChain(chain.id)] } },
        first: PROFILES_DISPLAY_REQUIRED_REQS,
      }),
    ),
  );

  const outPlus = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i].requests }),
    {} as Record<SupportedChainId, RequestsQuery['requests']>,
  );
  return mergeObjectsWithArrays(out, outPlus);
};

const _getPagedRequests = async () => {
  const res = await Promise.all(
    supportedChains.map((chain) =>
      sdk[chain.id].Requests({ first: PROFILES_DISPLAY_REQUIRED_REQS }),
    ),
  );
  const out = supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i].requests }),
    {} as Record<SupportedChainId, RequestsQuery['requests']>,
  );
  return await completeCrossChains(out);
};

export const getRequestsLoadingPromises = async (
  chainId: SupportedChainId,
  where: any,
  skipNumber: number,
): Promise<RequestsQuery> => {
  return sdk[chainId].Requests({
    where,
    first: PROFILES_DISPLAY_REQUIRED_REQS,
    skip: skipNumber,
  });
};

export const getRequestsInitData = async () => {
  return await getFilteredRequestsInitData(undefined);
};

export const getFilteredRequestsInitData = async (
  filtered: Record<SupportedChainId, RequestsQuery['requests']> | undefined,
) => {
  var all: Record<SupportedChainId, RequestsQuery['requests']> = await _getPagedRequests();
  var out: Record<SupportedChainId, RequestsQuery['requests']> = filtered ? filtered : all;
  return await sanitizeHeadRequests(all, out);
};

export const genRequestId = (pohId: Hash, index: number) => {
  return keccak256(
    concat([
      pohId,
      index >= 0
        ? toHex(index, { size: 32 })
        : index <= -100
          ? concat([toHex(Math.abs(index), { size: 32 }), toHex('bridged', { size: 7 })])
          : concat([toHex(Math.abs(index + 1), { size: 32 }), toHex('legacy', { size: 6 })]),
    ]),
  );
};

export const getRequestData = cache(
  async (chainId: SupportedChainId, pohId: Hash, index: number) => {
    const out = (await sdk[chainId]['Request']({ id: genRequestId(pohId, index) })).request;
    return await sanitizeRequest(out, chainId, pohId);
  },
);

export const getRequestsToAdvance = cache(
  async (chainId: SupportedChainId) => (await sdk[chainId]['RequestsToAdvance']()).status!.requests,
);

export const getOffChainVouches = async (
  chainId: SupportedChainId,
  claimer: Address,
  pohId: Hash,
) => {
  try {
    return (
      await axios.get(
        `${process.env.DEPLOYED_APP}/api/vouch/${chainId}/for-request/${claimer}/${pohId}`,
      )
    ).data as { voucher: Address; expiration: number; signature: Hash }[];
  } catch (err: any) {
    console.log(err);

    return [];
  }
};
