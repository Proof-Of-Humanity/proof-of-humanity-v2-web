import { SupportedChain, getChainRpc } from "config/chains";
import { getContractInfo } from "contracts";
import { cache } from "react";
import { Address, Hash, createPublicClient, http } from "viem";

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
