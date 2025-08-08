import { cache } from "react";
import { Address, Hex, createPublicClient, http } from "viem";
import { SupportedChainId, idToChain, getChainRpc } from "config/chains";
import { sdk } from "config/subgraph";
import { getContractInfo } from "contracts/registry";
import type { HumanityIdByClaimerQuery, RewardClaimQuery } from "generated/graphql";

export type RewardClaimStatus = {
  claimed: boolean;
  amount: bigint;
  chainId: SupportedChainId | null;
};

export const getRewardClaimStatus = cache(async (address: Address, chainId: SupportedChainId): Promise<RewardClaimStatus> => {
  const now = BigInt(Math.ceil(Date.now() / 1000));

  const humanityQuery = await sdk[chainId].HumanityIdByClaimer({ address, now });
  const localResult = humanityQuery as HumanityIdByClaimerQuery;
  const localHumanityId = localResult?.registrations?.[0]?.humanity?.id;

  const humanityId: Hex | null = localHumanityId || localResult?.crossChainRegistrations?.[0]?.id || null;

  if (!humanityId) {
    return { claimed: false, amount: 0n, chainId: null };
  }

  const rewardClaimQuery = await sdk[chainId].RewardClaim({ id: humanityId });
  const rewardClaimResult = rewardClaimQuery as RewardClaimQuery;
  if (rewardClaimResult?.rewardClaim) {
    return {
      claimed: true,
      amount: BigInt(rewardClaimResult.rewardClaim.amount),
      chainId,
    };
  }

  return { claimed: false, amount: 0n, chainId };
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
    return 0n; // KlerosLiquid not deployed yet
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