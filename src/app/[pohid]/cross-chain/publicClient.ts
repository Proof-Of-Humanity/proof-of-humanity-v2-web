import {
  getChainTransport,
  idToChain,
  type SupportedChainId,
} from "config/chains";
import { createPublicClient } from "viem";

export const getChainPublicClient = (chainId: SupportedChainId) =>
  createPublicClient({
    chain: idToChain(chainId),
    transport: getChainTransport(chainId),
  });
