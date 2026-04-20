import { getChainRpc, type SupportedChainId } from "config/chains";
import { createPublicClient, http } from "viem";

export const getChainPublicClient = (chainId: SupportedChainId) =>
  createPublicClient({
    transport: http(getChainRpc(chainId)),
  });
