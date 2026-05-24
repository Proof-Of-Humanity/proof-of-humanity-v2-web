import { type SupportedChain } from "config/chains";
import { type ContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { type Hash } from "viem";

import RevokeClient from "./RevokeClient";

interface RevokeProps {
  pohId: Hash;
  homeChain: SupportedChain;
  arbitrationInfo: ContractData["arbitrationInfo"];
  baseDeposit: ContractData["baseDeposit"];
}

export default async function Revoke({
  arbitrationInfo,
  baseDeposit,
  homeChain,
  pohId,
}: RevokeProps) {
  try {
    const arbitrationCost = await getArbitrationCost(
      homeChain,
      arbitrationInfo.arbitrator,
      arbitrationInfo.extraData,
    );

    return (
      <RevokeClient
        pohId={pohId}
        arbitrationInfo={arbitrationInfo}
        homeChain={homeChain}
        cost={arbitrationCost + BigInt(baseDeposit)}
      />
    );
  } catch {
    return (
      <RevokeClient
        pohId={pohId}
        arbitrationInfo={arbitrationInfo}
        homeChain={homeChain}
        unavailableReason="Unable to load the arbitration cost. Try again in a moment."
      />
    );
  }
}
