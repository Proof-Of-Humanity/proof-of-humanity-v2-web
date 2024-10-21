'use client';

import { observable } from '@legendapp/state';
import { enableReactUse } from '@legendapp/state/config/enableReactUse';
import { useMountOnce, useObservable, useSelector } from '@legendapp/state/react';
import cn from 'classnames';
import {
  SupportedChain,
  SupportedChainId,
  idToChain,
  legacyChain,
  supportedChains,
} from 'config/chains';
import { REQUESTS_DISPLAY_BATCH as REQUESTS_BATCH_SIZE, statusToColor } from 'config/misc';
import { RequestStatus, requestStatus, statusFilters } from 'config/requests';
import { getContractDataAllChains } from 'data/contract';
import {
  getFilteredRequestsInitData,
  getRequestsInitData,
  getRequestsLoadingPromises,
} from 'data/request';
import { useEffect, useState } from 'react';
import ChainLogo from 'components/ChainLogo';
import DropdownItem from 'components/Dropdown/Item';
import Dropdown from 'components/Dropdown/Menu';
import { RequestsQuery } from 'generated/graphql';
import { useLoading } from 'hooks/useLoading';
import { camelToTitle } from 'utils/case';
import Card from './Card';
import SubgraphsStatus from './SubgraphsStatus';
import Loading from 'app/[pohid]/loading';

enableReactUse();

var humanityLifespanAllChains: Record<SupportedChainId, string>;

export type RequestsQueryItem = ArrayElement<RequestsQuery['requests']>;

interface RequestInterface extends RequestsQueryItem {
  chainId: SupportedChainId;
  expired: boolean;
}

const sortRequests = (request: RequestInterface[]): RequestInterface[] => {
  const pohIdGrouped: Map<string, RequestInterface[]> = new Map();
  request.map((req) => {
    let pohIdArray = pohIdGrouped.get(req.humanity.id as string);
    if (!pohIdArray) pohIdArray = new Array<RequestInterface>();
    pohIdArray.push(req);
    pohIdGrouped.set(req.humanity.id, pohIdArray);
  });
  pohIdGrouped.forEach((val, key) => {
    val.sort((req1, req2) => req2.lastStatusChange - req1.lastStatusChange);
  });
  let requestsOut: RequestInterface[] = new Array<RequestInterface>();
  pohIdGrouped.forEach((val, key) => {
    // We keep only the head request of each pohIdGrouped array which is the one representing the current status of the personhood
    requestsOut.push(val[0]);
  });

  requestsOut.sort((req1, req2) => req2.lastStatusChange - req1.lastStatusChange);
  return requestsOut;
};

const isRequestExpired = (
  request: RequestsQueryItem,
  humanityLifespan: string | undefined,
): boolean => {
  if (request.status.id === 'resolved') {
    if (
      request.humanity.winnerClaim.length > 0 &&
      !!humanityLifespan &&
      request.humanity.winnerClaim[0].index === request.index
    ) {
      // Is this the winner request
      return (
        /* (Number(request.humanity.winnerClaim[0].resolutionTime) > 0 && 
            Number(request.humanity.winnerClaim[0].resolutionTime) + Number(humanityLifespan) < Date.now() / 1000) || 
          (Number(request.creationTime) + Number(humanityLifespan) < Date.now() / 1000) ||  */
        !request.humanity.registration ||
        Number(request.humanity.registration?.expirationTime) < Date.now() / 1000
      );
    } // else return (Number(request.creationTime) + Number(humanityLifespan) < Date.now() / 1000)
  } else if (request.status.id === 'transferring') {
    return Number(request.creationTime) + Number(humanityLifespan) < Date.now() / 1000;
  }
  return true;
};

const normalize = (requestsData: Record<SupportedChainId, RequestsQueryItem[]>) => {
  const requests = sortRequests(
    Object.keys(requestsData).reduce<RequestInterface[]>(
      (acc, chainId) => [
        ...acc,
        ...requestsData[Number(chainId) as SupportedChainId].map((request) => ({
          ...request,
          old: Number(chainId) === legacyChain.id,
          chainId: Number(chainId) as SupportedChainId,
          expired: isRequestExpired(
            request,
            humanityLifespanAllChains[Number(chainId) as SupportedChainId],
          ),
        })),
      ],
      [],
    ),
  );
  return requests;
};

const filterChainStacksForChain = (
  chainStacks: Record<SupportedChainId, RequestsQueryItem[]>,
  chainFilter: SupportedChainId | 0,
) =>
  supportedChains.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.id]: !chainFilter || chain.id === chainFilter ? acc[chain.id] : [],
    }),
    chainStacks,
  );

interface RequestFilter {
  search: string;
  status: RequestStatus;
  chainId: SupportedChainId | 0;
  cursor: number;
}

const filter$ = observable<RequestFilter>({
  search: '',
  status: 'all',
  chainId: 0,
  cursor: 1,
});

function RequestsGrid() {
  const filter = filter$.use();
  const chainStacks$ = useObservable(
    supportedChains.reduce(
      (acc, chain) => ({ ...acc, [chain.id]: [] }),
      {} as Record<SupportedChainId, RequestsQuery['requests']>,
    ),
  );

  const requests = useSelector(() =>
    normalize(chainStacks$.get()).slice(0, REQUESTS_BATCH_SIZE * filter.cursor),
  );

  const loading = useLoading(true, 'init');
  const [pending, loadingType] = loading.use();

  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => filter$.assign({ search: searchQuery, cursor: 1 }), 100);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useMountOnce(() => {
    (async () => {
      const contractData = await Promise.resolve(getContractDataAllChains());
      humanityLifespanAllChains = Object.keys(contractData).reduce(
        (acc, chainId) => {
          acc[Number(chainId) as SupportedChainId] =
            contractData[Number(chainId) as SupportedChainId].humanityLifespan;
          return acc;
        },
        {} as Record<SupportedChainId, string>,
      );

      chainStacks$.set(await getRequestsInitData());
      loading.stop();
    })();

    /* (async () => {
      chainStacks$.set(await getRequestsInitData());
      loading.stop();
    })(); */

    filter$.onChange(
      async ({ value: { chainId: chainFilter, search, status, cursor }, getPrevious }) => {
        loading.start();
        const loadContinued = cursor > getPrevious().cursor;
        const fetchChains: SupportedChain[] = [];
        const fetchPromises: Promise<RequestsQuery>[] = [];

        const chainStacks = filterChainStacksForChain(chainStacks$.get(), chainFilter);

        for (const chain of supportedChains) {
          if (chainFilter && chainFilter !== chain.id) continue;

          const displayedForChain = chainStacks[chain.id].length;

          if (
            !loadContinued ||
            displayedForChain + REQUESTS_BATCH_SIZE >= chainStacks[chain.id].length
          ) {
            const where = {
              ...requestStatus[status].filter,
              ...(search ? { claimer_: { name_contains: search } } : {}),
            };

            const skipNumber = loadContinued ? chainStacks[chain.id].length : 0;

            const promises = getRequestsLoadingPromises(chain.id, where, skipNumber);

            fetchChains.push(chain);
            fetchPromises.push(promises);
          }
        }

        if (!fetchChains.length) {
          chainStacks$.set(chainStacks);
        } else {
          const res = await Promise.all(fetchPromises);
          chainStacks$.set(
            await getFilteredRequestsInitData(
              fetchChains.reduce(
                (acc, chain, i) => ({
                  ...acc,
                  [chain.id]: [...(loadContinued ? chainStacks[chain.id] : []), ...res[i].requests],
                }),
                chainStacks,
              ),
            ),
          );
        }

        loading.stop();
      },
    );
  });

  if (pending && loadingType === 'init') return <Loading />;

  return (
    <>
      <SubgraphsStatus />
      <div className="my-4 flex gap-1 py-2 md:gap-2">
        <input
          className="border-stroke text-primaryText bg-whiteBackground w-full rounded border p-2 md:mr-2"
          placeholder="Search (case sensitive)"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dropdown title={filter.status === 'all' ? 'Status' : camelToTitle(filter.status)}>
          {statusFilters.map((status) => (
            <DropdownItem
              key={status}
              icon={
                <div
                  className={cn(
                    'dot mr-2',
                    statusToColor[status as keyof typeof statusToColor]
                      ? `bg-status-${statusToColor[status as keyof typeof statusToColor]}`
                      : 'bg-white',
                  )}
                />
              }
              selected={filter.status === status}
              onSelect={() => filter$.assign({ status, cursor: 1 })}
              name={camelToTitle(status)}
            />
          ))}
        </Dropdown>
        <Dropdown
          title={camelToTitle(
            filter.chainId ? idToChain(filter.chainId as SupportedChainId)!.name : 'Chain',
          )}
        >
          <DropdownItem
            selected={!filter.chainId}
            onSelect={() => filter$.assign({ chainId: 0, cursor: 1 })}
            name="All"
          />
          {supportedChains.map((chain) => (
            <DropdownItem
              icon={<ChainLogo chainId={chain.id} className="fill-primaryText mr-1 h-4 w-4" />}
              key={chain.id}
              selected={filter.chainId === chain.id}
              onSelect={() => filter$.assign({ chainId: chain.id, cursor: 1 })}
              name={chain.name}
            />
          ))}
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {requests.map((request, i) => (
          <Card
            key={i}
            chainId={request.chainId}
            index={request.index}
            humanity={request.humanity}
            requester={request.requester}
            claimer={request.claimer}
            status={request.status.id}
            revocation={request.revocation}
            registrationEvidenceRevokedReq={request.registrationEvidenceRevokedReq}
            evidence={request.evidenceGroup.evidence}
            expired={request.expired}
          />
        ))}
      </div>

      {!pending && (
        <button
          className="btn-main gradient mx-auto my-8 px-8 py-4"
          onClick={() => filter$.cursor.set((c) => c + 1)}
        >
          Load More
        </button>
      )}
    </>
  );
}

export default RequestsGrid;
