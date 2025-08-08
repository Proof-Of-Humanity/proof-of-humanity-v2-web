import {
  SupportedChain,
  SupportedChainId,
  getChainRpc,
  supportedChains,
} from "config/chains";
import { getContractInfo } from "contracts";
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
      abi: getContractInfo("KlerosLiquid", chain.id).abi,
      functionName: "arbitrationCost",
      args: [extraData],
    }),
);

export const getTotalCosts = cache(
  async (contractData: Record<SupportedChainId, ContractData>) => {
    const res = await Promise.all(
      supportedChains.map(
        async (chain) =>
          ((await getArbitrationCost(
            chain,
            contractData[chain.id].arbitrationInfo.arbitrator,
            contractData[chain.id].arbitrationInfo.extraData,
          )) as bigint) + BigInt(contractData[chain.id].baseDeposit),
      ),
    );

    return supportedChains.reduce(
      (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
      {} as Record<SupportedChainId, bigint>,
    );
  },
);
