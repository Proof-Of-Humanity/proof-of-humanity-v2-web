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
  PROFILES_DISPLAY_REQUIRED_REQS,
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
  retry: number;
}

const filter$ = observable<RequestFilter>({
  search: "",
  status: RequestStatus.ALL,
  chainId: 0,
  cursor: 1,
  retry: 0,
});

const SkeletonCard = () => (
  <div className="border-stroke bg-whiteBackground relative aspect-[5/4] w-full animate-pulse overflow-hidden rounded-card border shadow-soft-inset">
    <div className="absolute inset-x-0 top-0 flex justify-between px-4 pt-[9px]">
      <div className="bg-grey h-6 w-24 rounded-full" />
      <div className="bg-grey h-6 w-6 rounded-full" />
    </div>
    <div className="absolute inset-x-0 bottom-0 px-4 pb-[21px]">
      <div className="bg-grey h-6 w-2/3 rounded" />
      <div className="bg-grey mt-2 h-4 w-1/3 rounded" />
    </div>
  </div>
);

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
      300,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [hasMore, setHasMore] = useState(true);
  // a chain whose raw page came back full probably has a next page;
  // all pages short of the raw batch size means the backend is exhausted
  const anyFullPage = (
    stacks: Partial<Record<SupportedChainId, RequestsQuery["requests"]>>,
  ) =>
    Object.values(stacks).some(
      (reqs) => (reqs?.length ?? 0) >= PROFILES_DISPLAY_REQUIRED_REQS,
    );

  const loadInit = async () => {
    loading.start("init");
    setLoadError(false);
    try {
      const contractData = await Promise.resolve(getContractDataAllChains());
      humanityLifespanAllChains = Object.keys(contractData).reduce(
        (acc, chainId) => {
          acc[Number(chainId) as SupportedChainId] =
            contractData[Number(chainId) as SupportedChainId]?.humanityLifespan;
          return acc;
        },
        {} as Record<SupportedChainId, string | undefined>,
      );

      const initData = await getRequestsInitData();
      setHasMore(anyFullPage(initData));
      chainStacks$.set(initData);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setLoadError(true);
    } finally {
      loading.stop();
    }
  };

  const retryLoad = () => {
    // if init never succeeded we need contract data too, else re-run the current filter fetch
    if (!humanityLifespanAllChains) loadInit();
    else filter$.assign({ retry: filter$.retry.peek() + 1, cursor: 1 });
  };

  const clearFilters = () => {
    setSearchQuery("");
    filter$.assign({
      search: "",
      status: RequestStatus.ALL,
      chainId: 0,
      cursor: 1,
    });
  };

  useMountOnce(() => {
    loadInit();

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
                ...(search
                  ? { claimer_: { name_contains_nocase: search } }
                  : {}),
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
            setHasMore(
              res.some(
                (r) =>
                  (r?.requests ?? []).length >= PROFILES_DISPLAY_REQUIRED_REQS,
              ),
            );
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

  const showSkeleton =
    pending && (loadingType === "init" || filter.cursor === 1);
  const showError = !showSkeleton && loadError && requests.length === 0;
  const showEmpty =
    !showSkeleton && !pending && !loadError && requests.length === 0;
  const hasActiveFilter =
    !!filter.search || filter.status !== RequestStatus.ALL || !!filter.chainId;
  const showLoadMore =
    !showSkeleton && !showError && !showEmpty && requests.length > 0 && hasMore;

  return (
    <>
      <div className="my-4 flex flex-col gap-2 py-2 sm:flex-row sm:gap-1 md:gap-2">
        <SearchBar
          className="md:mr-2"
          value={searchQuery}
          onSearch={setSearchQuery}
        />
        <Dropdown
          title={
            filter.status === RequestStatus.ALL
              ? "Status"
              : getStatusLabel(filter.status)
          }
          active={filter.status !== RequestStatus.ALL}
          onClear={() =>
            filter$.assign({ status: RequestStatus.ALL, cursor: 1 })
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
          active={!!filter.chainId}
          onClear={() => filter$.assign({ chainId: 0, cursor: 1 })}
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

      {showSkeleton ? (
        <div
          className="request-grid"
          role="status"
          aria-label="Loading profiles"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : showError ? (
        <div className="text-primaryText flex flex-col items-center gap-2 py-16 text-center">
          <span className="font-semibold">
            Unable to load profiles right now.
          </span>
          <span className="text-secondaryText text-sm">
            Our data services appear to be unavailable.
          </span>
          <button
            type="button"
            className="btn-primary gradient mt-4 px-8 py-3"
            onClick={retryLoad}
          >
            Retry
          </button>
        </div>
      ) : showEmpty ? (
        <div className="text-primaryText flex flex-col items-center gap-2 py-16 text-center">
          <span className="font-semibold">No profiles found.</span>
          <span className="text-secondaryText text-sm">
            {hasActiveFilter
              ? "Try adjusting your search or filters."
              : "No profiles have been submitted yet."}
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              className="btn-primary gradient mt-4 px-8 py-3"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="request-grid">
          {requests.map((request, i) => (
            <div
              key={`${request.chainId}-${request.humanity.id}-${request.index}`}
              className="motion-safe:animate-cardIn"
              style={{
                animationDelay: `${(i % REQUESTS_BATCH_SIZE) * 30}ms`,
              }}
            >
              <Card
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
            </div>
          ))}
        </div>
      )}

      {showLoadMore && (
        <button
          className="btn-primary gradient my-8 px-8 py-4 disabled:opacity-60 md:mx-auto"
          disabled={pending}
          onClick={() => filter$.cursor.set((c) => c + 1)}
        >
          {pending ? "Loading…" : "Load More"}
        </button>
      )}
    </>
  );
}

export default RequestsGrid;
