import { getChainTransport, type SupportedChainId } from "config/chains";
import { createPublicClient } from "viem";

export const getChainPublicClient = (chainId: SupportedChainId) =>
  createPublicClient({
    transport: getChainTransport(chainId),
  });
