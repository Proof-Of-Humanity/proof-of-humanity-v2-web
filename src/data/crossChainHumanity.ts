import { getChainRpc, SupportedChainId, supportedChains } from "config/chains";
import { getContractInfo } from "contracts";
import { cache } from "react";
import { createPublicClient, http, type Hash } from "viem";

export type CrossChainHumanityState = {
  owner: `0x${string}`;
  expirationTime: number;
  lastTransferTime: number;
  isHomeChain: boolean;
};

const getCrossChainHumanityState = cache(
  async (chainId: SupportedChainId, humanityId: Hash) => {
    const publicClient = createPublicClient({
      transport: http(getChainRpc(chainId)),
    });
    const [owner, expirationTime, lastTransferTime, isHomeChain] =
      await publicClient.readContract({
        address: getContractInfo("CrossChainProofOfHumanity", chainId)
          .address as `0x${string}`,
        abi: getContractInfo("CrossChainProofOfHumanity", chainId).abi,
        functionName: "humanityData",
        args: [humanityId],
      });

    return {
      owner: owner as `0x${string}`,
      expirationTime: Number(expirationTime),
      lastTransferTime: Number(lastTransferTime),
      isHomeChain,
    };
  },
);

export const getCrossChainHumanityStateAllChains = cache(
  async (humanityId: Hash) => {
    const states = await Promise.all(
      supportedChains.map((chain) =>
        getCrossChainHumanityState(chain.id, humanityId),
      ),
    );

    return supportedChains.reduce(
      (acc, chain, index) => ({
        ...acc,
        [chain.id]: states[index],
      }),
      {} as Record<SupportedChainId, CrossChainHumanityState>,
    );
  },
);
