import {
  SupportedChain,
  SupportedChainId,
  getChainRpc,
  supportedChains,
} from "config/chains";
import abis from "contracts/abis";
import { cache } from "react";
import { Address, Hash, createPublicClient, http } from "viem";
import { ContractData } from "./contract";

export const getArbitrationCost = cache(
  async (chain: SupportedChain, arbitrator: Address, extraData: Hash) =>
    await createPublicClient({
      chain,
      transport: http(getChainRpc(chain.id)),
    }).readContract({
      address: arbitrator,
      abi: abis.KlerosLiquid,
      functionName: "arbitrationCost",
      args: [extraData],
    }),
);

export const getTotalCosts = cache(
  async (contractData: Record<SupportedChainId, ContractData>) => {
    const res = await Promise.all(
      supportedChains.map(
        async (chain) =>
          (await getArbitrationCost(
            chain,
            contractData[chain.id].arbitrationInfo.arbitrator,
            contractData[chain.id].arbitrationInfo.extraData,
          )) + BigInt(contractData[chain.id].baseDeposit),
      ),
    );

    return supportedChains.reduce(
      (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
      {} as Record<SupportedChainId, bigint>,
    );
  },
);
