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
                  humanityLifespanAllChains?.[
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
  const [failedChainIds, setFailedChainIds] = useState<SupportedChainId[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(
      () => filter$.assign({ search: searchQuery, cursor: 1 }),
      100,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const ensureContractData = async () => {
    if (humanityLifespanAllChains) return;
    const contractData = await getContractDataAllChains();
    humanityLifespanAllChains = Object.keys(contractData).reduce(
      (acc, chainId) => {
        acc[Number(chainId) as SupportedChainId] =
          contractData[Number(chainId) as SupportedChainId]?.humanityLifespan;
        return acc;
      },
      {} as Record<SupportedChainId, string | undefined>,
    );
  };

  const loadInit = async () => {
    loading.start("init");
    setLoadError(false);
    setFailedChainIds([]);
    try {
      await ensureContractData();
      const { stacks, failedChainIds: failed } = await getRequestsInitData();
      chainStacks$.set(stacks);
      setFailedChainIds(failed);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setLoadError(true);
    } finally {
      loading.stop();
    }
  };

  const loadFiltered = async (
    value: RequestFilter,
    loadContinued: boolean,
    loadingType?: string,
  ) => {
    const { chainId: chainFilter, search, status } = value;
    loading.start(loadingType);
    setLoadError(false);
    setFailedChainIds([]);
    try {
      await ensureContractData();
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
            ...(search ? { claimer_: { name_contains_nocase: search } } : {}),
          };

          const skipNumber = loadContinued ? chainStacks[chain.id].length : 0;

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
        return;
      }

      // A rejected chain means "unknown", not "no results": keep its slot
      // empty but report it, so the outage is surfaced instead of read as
      // an empty grid.
      const settled = await Promise.allSettled(fetchPromises);
      const fetchFailedChainIds: SupportedChainId[] = [];
      const res: RequestsQuery[] = settled.map((result, i) => {
        if (result.status === "fulfilled") return result.value;
        const chain = fetchChains[i];
        if (chain) {
          console.error(
            `Subgraph query failed on ${chain.name}:`,
            result.reason,
          );
          fetchFailedChainIds.push(chain.id);
        }
        return { requests: [] };
      });

      const { stacks, failedChainIds: initFailed } =
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
        );
      chainStacks$.set(stacks);
      // A filtered-out chain's outage still matters: bridged profiles on the
      // displayed chain are completed from the foreign chain's subgraph.
      setFailedChainIds([...new Set([...fetchFailedChainIds, ...initFailed])]);
      // Every chain of the current view failed — there is no live data
      // source for what the user asked to see.
      if (fetchFailedChainIds.length === fetchChains.length) setLoadError(true);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setLoadError(true);
    } finally {
      loading.stop();
    }
  };

  const retry = () => {
    const value = filter$.get();
    const isDefaultFilter =
      !value.search && value.status === RequestStatus.ALL && !value.chainId;
    if (isDefaultFilter) void loadInit();
    else void loadFiltered(value, false, "init");
  };

  useMountOnce(() => {
    void loadInit();

    filter$.onChange(({ value, getPrevious }) => {
      void loadFiltered(value, value.cursor > getPrevious().cursor);
    });
  });

  if (pending && loadingType === "init") return <Loading />;

  const showFullError = loadError && requests.length === 0;
  const failedChainNames = failedChainIds
    .map((chainId) => idToChain(chainId)?.name)
    .filter(Boolean)
    .join(", ");

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

      {!showFullError && failedChainIds.length > 0 && (
        <div className="status-pill-warning mb-4 flex flex-wrap items-center justify-between gap-2 rounded-card border px-4 py-3 text-sm">
          <span>
            Some profiles may be missing right now — live data for{" "}
            {failedChainNames} is temporarily unavailable.
          </span>
          <button className="font-semibold underline" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {showFullError ? (
        <div className="text-primaryText flex flex-col items-center gap-2 py-16 text-center">
          <span className="font-semibold">
            Unable to load profiles right now.
          </span>
          <span className="text-secondaryText text-sm">
            Our data services appear to be unavailable. Please try again later.
          </span>
          <button
            className="btn-primary gradient mt-4 px-8 py-3"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="request-grid">
            {requests.map((request) => (
              <Card
                key={`${request.chainId}-${request.humanity.id}-${request.index}`}
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
              className="btn-primary gradient my-8 px-8 py-4 md:mx-auto"
              onClick={() => filter$.cursor.set((c) => c + 1)}
            >
              Load More
            </button>
          )}
        </>
      )}
    </>
  );
}

export default RequestsGrid;
