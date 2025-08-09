import { getChainRpc, idToChain, SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts/registry";
import { cache } from "react";
import { createPublicClient, http } from "viem";

const GNOSIS_HUMANITY_SUBCOURT_ID = 18n;
const CHIADO_HUMANITY_SUBCOURT_ID = 0n;

export const getHumanityCourtFeeForJuror = cache(async (chainId: SupportedChainId) => {
    const liquidInfo = getContractInfo("KlerosLiquid", chainId);
    console.log("liquidInfo", liquidInfo);
    if (!liquidInfo.address) {
      throw new Error(`KlerosLiquid not deployed on chain ${chainId}`);
    }
  
    const chain = idToChain(chainId);
    if (!chain) {
      throw new Error(`Unsupported chain ${chainId}`);
    }
  
    const publicClient = createPublicClient({
      chain,
      transport: http(getChainRpc(chain.id)),
    });
    const courtId = chainId === 100 ? GNOSIS_HUMANITY_SUBCOURT_ID : CHIADO_HUMANITY_SUBCOURT_ID;
    const court = await publicClient.readContract({
      address: liquidInfo.address as `0x${string}`,
      abi: liquidInfo.abi,
      functionName: "courts",
      args: [courtId],
    });
    
    const feeForJuror = court[4];
    return feeForJuror;
  });         