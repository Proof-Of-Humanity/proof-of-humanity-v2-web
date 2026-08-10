import { SupportedChainId, idToChain } from "config/chains";

const OutageNotice = ({
  chainIds,
  onRetry,
}: {
  chainIds: SupportedChainId[];
  onRetry: () => void;
}) => (
  <div className="status-pill-warning mb-4 flex flex-wrap items-center justify-between gap-2 rounded-card border px-4 py-3 text-sm">
    <span>
      Some profiles may be missing right now — live data for{" "}
      {chainIds
        .map((chainId) => idToChain(chainId)?.name)
        .filter(Boolean)
        .join(", ")}{" "}
      is temporarily unavailable.
    </span>
    <button type="button" className="font-semibold underline" onClick={onRetry}>
      Retry
    </button>
  </div>
);

export default OutageNotice;
