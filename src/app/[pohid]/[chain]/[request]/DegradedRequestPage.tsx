import { SupportedChain } from "config/chains";
import { getHistoricalWinnerClaim } from "data/request";
import { prettifyId } from "utils/identifier";
import type { Address, Hash } from "viem";

import ProfileTimelineHeader from "app/[pohid]/ProfileTimelineHeader";

import { ChainDataUnavailableCard } from "./RequestErrorState";

interface DegradedRequestPageProps {
  chain: SupportedChain;
  pohId: Hash;
}

/**
 * Partial view of a request whose own chain's subgraph is down. The request
 * payload itself is gone, but the latest verified identity for the PoH ID can
 * still be recovered from the live chains' records.
 */
export default async function DegradedRequestPage({
  chain,
  pohId,
}: DegradedRequestPageProps) {
  const winnerClaim = await getHistoricalWinnerClaim(
    pohId,
    Math.floor(Date.now() / 1000),
  ).catch(() => null);

  return (
    <>
      {winnerClaim ? (
        <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
          <div className="border-stroke bg-whiteBackground mb-1 rounded border px-[24px] py-[18px] shadow lg:px-[32px]">
            <div className="text-secondaryText mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
              Latest verified identity for this PoH ID
            </div>
            <ProfileTimelineHeader
              claimer={winnerClaim.claimer}
              evidence={winnerClaim.evidenceGroup.evidence}
              requester={winnerClaim.requester as Address}
            />
            <div className="text-secondaryText text-xs uppercase tracking-[0.08em]">
              POH ID
            </div>
            <div className="text-primaryText break-all text-sm font-semibold">
              {prettifyId(pohId)}
            </div>
          </div>
        </div>
      ) : null}
      <ChainDataUnavailableCard chainName={chain.name} />
    </>
  );
}
