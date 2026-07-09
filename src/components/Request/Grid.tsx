"use client";

import { observable } from "@legendapp/state";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import {
  useMountOnce,
  useObservable,
  useSelector,
} from "@legendapp/state/react";
import {
  SupportedChain,
  SupportedChainId,
  idToChain,
  legacyChain,
  supportedChains,
} from "config/chains";
import { getContractDataAllChains } from "data/contract";
import {
  getFilteredRequestsInitData,
  getRequestsInitData,
  getRequestsLoadingPromises,
} from "data/request";
import { useEffect, useState } from "react";
import ChainLogo from "components/ChainLogo";
import DropdownItem from "components/Dropdown/Item";
import Dropdown from "components/Dropdown/Menu";
import SearchBar from "components/SearchBar";
import StatusIcon from "components/StatusIcon";
import { RequestsQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import {
  getStatus,
  RequestStatus,
  getRequestStatusFilter,
  STATUS_FILTER_OPTIONS,
  getStatusLabel,
} from "utils/status";

import Card from "./Card";
import Loading from "components/Loading";

enableReactUse();

const REQUESTS_BATCH_SIZE = 12;
let humanityLifespanAllChains: Record<SupportedChainId, string | undefined>;

export type RequestsQueryItem = ArrayElement<RequestsQuery["requests"]>;

const isTransferArtifactRequest = (request: {
  index: number | string;
  status?: {
    id: string;
  } | null;
}) =>
  request.status?.id === "transferred" || request.status?.id === "transferring";

interface RequestInterface extends RequestsQueryItem {
  chainId: SupportedChainId;
  requestStatus: RequestStatus;
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
  const requestsOut: RequestInterface[] = new Array<RequestInterface>();
  pohIdGrouped.forEach((val, key) => {
    // We keep only the head request of each pohIdGrouped array which is the one representing the current status of the personhood
    const latestRequest = val[0];
    if (latestRequest) requestsOut.push(latestRequest);
  });

  requestsOut.sort(
    (req1, req2) => req2.lastStatusChange - req1.lastStatusChange,
  );
  return requestsOut;
};

const normalize = (
  requestsData: Record<SupportedChainId, RequestsQueryItem[]>,
) => {
  const requests = sortRequests(
    Object.keys(requestsData).reduce<RequestInterface[]>(
      (acc, chainId) => [
        ...acc,
        ...(requestsData[Number(chainId) as SupportedChainId] ?? []).map(
          (request) => {
            const requestStatus = getStatus(
              {
                status: request.status,
                revocation: request.revocation,
                index: request.index,
                creationTime: request.creationTime,
                expirationTime: request.expirationTime,
                winnerParty: request.winnerParty,
              },
              {
                humanityLifespan:
                  humanityLifespanAllChains[
                    Number(chainId) as SupportedChainId
                  ],
              },
            );

            return {
              ...request,
              old: Number(chainId) === legacyChain.id,
              chainId: Number(chainId) as SupportedChainId,
              requestStatus,
            };
          },
        ),
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
  search: "",
  status: RequestStatus.ALL,
  chainId: 0,
  cursor: 1,
});

function RequestsGrid() {
  const filter = filter$.use();
  const chainStacks$ = useObservable(
    supportedChains.reduce(
      (acc, chain) => ({ ...acc, [chain.id]: [] }),
      {} as Record<SupportedChainId, RequestsQuery["requests"]>,
    ),
  );

  const requests = useSelector(() =>
    normalize(
      supportedChains.reduce(
        (acc, chain) => ({
          ...acc,
          [chain.id]: chainStacks$
            .get()
            [chain.id].filter((request) => !isTransferArtifactRequest(request)),
        }),
        {} as Record<SupportedChainId, RequestsQuery["requests"]>,
      ),
    ).slice(0, REQUESTS_BATCH_SIZE * filter.cursor),
  );

  const loading = useLoading(true, "init");
  const [pending, loadingType] = loading.use();

  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(
      () => filter$.assign({ search: searchQuery, cursor: 1 }),
      100,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useMountOnce(() => {
    (async () => {
      try {
        const contractData = await Promise.resolve(getContractDataAllChains());
        humanityLifespanAllChains = Object.keys(contractData).reduce(
          (acc, chainId) => {
            acc[Number(chainId) as SupportedChainId] =
              contractData[
                Number(chainId) as SupportedChainId
              ]?.humanityLifespan;
            return acc;
          },
          {} as Record<SupportedChainId, string | undefined>,
        );

        chainStacks$.set(await getRequestsInitData());
      } catch (err) {
        console.error("Failed to load requests:", err);
        setLoadError(true);
      } finally {
        loading.stop();
      }
    })();

    /* (async () => {
      chainStacks$.set(await getRequestsInitData());
      loading.stop();
    })(); */

    filter$.onChange(
      async ({
        value: { chainId: chainFilter, search, status, cursor },
        getPrevious,
      }) => {
        loading.start();
        setLoadError(false);
        try {
          const loadContinued = cursor > getPrevious().cursor;
          const fetchChains: SupportedChain[] = [];
          const fetchPromises: Promise<RequestsQuery>[] = [];

          const chainStacks = filterChainStacksForChain(
            chainStacks$.get(),
            chainFilter,
          );

          for (const chain of supportedChains) {
            if (chainFilter && chainFilter !== chain.id) continue;

            const displayedForChain = chainStacks[chain.id].length;

            if (
              !loadContinued ||
              displayedForChain + REQUESTS_BATCH_SIZE >=
                chainStacks[chain.id].length
            ) {
              const where: any = {
                ...getRequestStatusFilter(status),
                ...(search ? { claimer_: { name_contains: search } } : {}),
              };

              const skipNumber = loadContinued
                ? chainStacks[chain.id].length
                : 0;

              const promises = getRequestsLoadingPromises(
                chain.id,
                where,
                skipNumber,
              );

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
                    [chain.id]: [
                      ...(loadContinued ? chainStacks[chain.id] : []),
                      ...(res[i]?.requests ?? []),
                    ],
                  }),
                  chainStacks,
                ),
              ),
            );
          }
        } catch (err) {
          console.error("Failed to load requests:", err);
          setLoadError(true);
        } finally {
          loading.stop();
        }
      },
    );
  });

  if (pending && loadingType === "init") return <Loading />;

  if (loadError && requests.length === 0)
    return (
      <div className="text-primaryText flex flex-col items-center gap-2 py-16 text-center">
        <span className="font-semibold">
          Unable to load profiles right now.
        </span>
        <span className="text-secondaryText text-sm">
          Our data services appear to be unavailable. Please try again later.
        </span>
      </div>
    );

  return (
    <>
      <div className="my-4 flex flex-col gap-2 py-2 sm:flex-row sm:gap-1 md:gap-2">
        <SearchBar className="md:mr-2" onSearch={setSearchQuery} />
        <Dropdown
          title={
            filter.status === RequestStatus.ALL
              ? "Status"
              : getStatusLabel(filter.status)
          }
        >
          {STATUS_FILTER_OPTIONS.map((status) => (
            <DropdownItem
              key={status}
              icon={<StatusIcon status={status} className="mr-2" />}
              selected={filter.status === status}
              onSelect={() => filter$.assign({ status, cursor: 1 })}
              name={getStatusLabel(status)}
            />
          ))}
        </Dropdown>
        <Dropdown
          title={
            filter.chainId
              ? idToChain(filter.chainId as SupportedChainId)!.name
              : "Chain"
          }
        >
          <DropdownItem
            selected={!filter.chainId}
            onSelect={() => filter$.assign({ chainId: 0, cursor: 1 })}
            name="All"
          />
          {supportedChains.map((chain) => (
            <DropdownItem
              icon={
                <ChainLogo
                  chainId={chain.id}
                  className="fill-primaryText mr-1 h-4 w-4"
                />
              }
              key={chain.id}
              selected={filter.chainId === chain.id}
              onSelect={() => filter$.assign({ chainId: chain.id, cursor: 1 })}
              name={chain.name}
            />
          ))}
        </Dropdown>
      </div>

      <div className="request-grid">
        {requests.map((request, i) => (
          <Card
            key={i}
            aspectRatio="wide"
            chainId={request.chainId}
            index={request.index}
            humanity={request.humanity}
            requester={request.requester}
            claimer={request.claimer}
            requestStatus={request.requestStatus}
            revocation={request.revocation}
            registrationEvidenceRevokedReq={
              request.registrationEvidenceRevokedReq
            }
            evidence={request.evidenceGroup.evidence}
          />
        ))}
      </div>

      {!pending && (
        <button
          className="btn-main gradient my-8 px-8 py-4 md:mx-auto"
          onClick={() => filter$.cursor.set((c) => c + 1)}
        >
          Load More
        </button>
      )}
    </>
  );
}

export default RequestsGrid;
