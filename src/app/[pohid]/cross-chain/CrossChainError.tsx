import CrossChainStatusStrip from "./CrossChainStatusStrip";

export default function CrossChainError({ error }: { error: Error }) {
  return (
    <div className="w-full border-t px-4 py-3" title={error.message}>
      <CrossChainStatusStrip
        title="Cross-chain unavailable"
        description="Bridge status could not be loaded. Refresh the page or try again in a moment."
      />
    </div>
  );
}
