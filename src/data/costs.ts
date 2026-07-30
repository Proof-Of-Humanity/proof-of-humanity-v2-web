import {
  SupportedChain,
  SupportedChainId,
  getChainTransport,
  supportedChains,
} from "config/chains";
import { getContractInfo } from "contracts";
import { cache } from "react";
import { Address, Hash, createPublicClient } from "viem";
import { ContractData } from "./contract";

export const getArbitrationCost = cache(
  async (chain: SupportedChain, arbitrator: Address, extraData: Hash) =>
    await createPublicClient({
      chain,
      transport: getChainTransport(chain.id),
    }).readContract({
      address: arbitrator,
      abi: getContractInfo("KlerosLiquid", chain.id).abi,
      functionName: "arbitrationCost",
      args: [extraData],
    }),
);

export const getTotalCosts = cache(
  async (contractData: Record<SupportedChainId, ContractData | null>) => {
    const res = await Promise.all(
      supportedChains.map(async (chain): Promise<bigint | null> => {
        const data = contractData[chain.id];
        if (!data) return null;
        try {
          return (
            ((await getArbitrationCost(
              chain,
              data.arbitrationInfo.arbitrator,
              data.arbitrationInfo.extraData,
            )) as bigint) + BigInt(data.baseDeposit)
          );
        } catch (err) {
          console.error(`Arbitration cost fetch failed on ${chain.name}:`, err);
          return null;
        }
      }),
    );

    return supportedChains.reduce(
      (acc, chain, i) => ({ ...acc, [chain.id]: res[i] ?? null }),
      {} as Record<SupportedChainId, bigint | null>,
    );
  },
);
