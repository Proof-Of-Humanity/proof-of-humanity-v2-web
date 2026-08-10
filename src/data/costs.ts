import { SupportedChain, getChainTransport } from "config/chains";
import { getContractInfo } from "contracts";
import { cache } from "react";
import { Address, Hash, createPublicClient } from "viem";

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
