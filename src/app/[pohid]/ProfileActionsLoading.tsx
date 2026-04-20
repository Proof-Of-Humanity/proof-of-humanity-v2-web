import CrossChainLoading from "./cross-chain/CrossChainLoading";

export default function ProfileActionsLoading() {
  return (
    <div className="mt-4 flex w-full animate-pulse flex-col items-center self-stretch">
      <div className="bg-grey mb-4 h-10 w-28 rounded" />
      <div className="w-full">
        <CrossChainLoading />
      </div>
    </div>
  );
}
