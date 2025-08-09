import { cache } from "react";
import { Address, Hex, createPublicClient, http } from "viem";
import { SupportedChainId, idToChain, getChainRpc } from "config/chains";
import { sdk } from "config/subgraph";
import { getContractInfo } from "contracts/registry";
import type { HumanityIdByClaimerQuery, RewardClaimQuery } from "generated/graphql";

export interface ProcessedAirdropData {
  walletAddress: string;
  humanityId: string | null;
  claimStatus: "claimed" | "eligible" | "not_eligible" | "checking";
  amount: bigint;
  chainId: SupportedChainId | null;
}

export const getProcessedAirdropData = cache(async (address: Address, chainId: SupportedChainId): Promise<ProcessedAirdropData> => {
  if (!address) {
    throw new Error("Address is required");
  }

    const now = Math.ceil(Date.now() / 1000);

    const humanityQuery = await sdk[chainId].HumanityIdByClaimer({ address, now });

    if (!humanityQuery) {
      throw new Error("Failed to fetch data from subgraph");
    }

    const localResult = humanityQuery as HumanityIdByClaimerQuery;
    const localHumanityId = localResult?.registrations?.[0]?.humanity?.id;
    const crossChainId = localResult?.crossChainRegistrations?.[0]?.id;
    const humanityId = localHumanityId || crossChainId || null;

    if (!humanityId) {
      return {
        walletAddress: address,
        humanityId: null,
        claimStatus: "not_eligible",
        amount: 0n,
        chainId: null,
      };
    }

    const rewardClaimResult = await sdk[chainId].RewardClaim({ id: humanityId });
    
    if (rewardClaimResult?.rewardClaim) {
      return {
        walletAddress: address,
        humanityId,
        claimStatus: "claimed",
        amount: BigInt(rewardClaimResult.rewardClaim.amount),
        chainId,
      };
    }

    return {
      walletAddress: address,
      humanityId,
      claimStatus: "eligible",
      amount: 0n,
      chainId,
    };
});

export const getAirdropContractData = cache(async (chainId: SupportedChainId) => {
  const distributorInfo = getContractInfo("PnkRewardDistributer", chainId);
  if (!distributorInfo.address) {
    throw new Error(`PnkRewardDistributer not deployed on chain ${chainId}`);
  }

  const chain = idToChain(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain ${chainId}`);
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(getChainRpc(chain.id)),
  });

  const amountPerClaim = await publicClient.readContract({
    address: distributorInfo.address as `0x${string}`,
    abi: distributorInfo.abi,
    functionName: "amountPerClaim",
  });

  return {
    amountPerClaim: amountPerClaim as bigint,
    distributorAddress: distributorInfo.address,
  };
});

export const getCurrentStake = cache(async (address: Address, chainId: SupportedChainId, subcourtId: bigint) => {
  const liquidInfo = getContractInfo("KlerosLiquid", chainId);
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

  const stake = await publicClient.readContract({
    address: liquidInfo.address as `0x${string}`,
    abi: liquidInfo.abi,
    functionName: "stakeOf",
    args: [address, subcourtId],
  });

  return stake as bigint;
});