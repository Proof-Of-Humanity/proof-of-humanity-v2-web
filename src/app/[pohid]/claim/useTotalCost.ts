import { useQuery } from "@tanstack/react-query";
import { SupportedChainId, idToChain } from "config/chains";
import { ContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { Hash } from "viem";

/**
 * Total deposit (base + live arbitration cost) for a chain, in wei.
 * Cached by chain id, so concurrent callers share one fetch. Timeout comes
 * from viem's http transport (10s default); retries from react-query.
 */
export const useTotalCost = (
  chainId: SupportedChainId,
  contractData: Record<SupportedChainId, ContractData | null>,
  enabled = true,
) =>
  useQuery({
    queryKey: ["totalCost", chainId],
    queryFn: async () => {
      const data = contractData[chainId];
      if (!data) throw new Error(`No contract data for chain ${chainId}`);
      const arbitrationCost = await getArbitrationCost(
        idToChain(chainId)!,
        data.arbitrationInfo.arbitrator as `0x${string}`,
        data.arbitrationInfo.extraData as Hash,
      );
      return BigInt(data.baseDeposit) + arbitrationCost;
    },
    retry: 2,
    enabled,
  });
