import { ProofOfHumanity } from "./deployments/ProofOfHumanity";
import { CrossChainProofOfHumanity } from "./deployments/CrossChainProofOfHumanity";
import { GnosisAMBHelper } from "./deployments/GnosisAMBHelper";
import { EthereumAMBBridge } from "./deployments/EthereumAMBBridge";
import { CirclesIntegration } from "./deployments/CirclesIntegration";
import { CirclesHub } from "./deployments/CirclesHub";
import { KlerosLiquid } from "./deployments/KlerosLiquid";
import { isAddress } from "viem";

export const contractRegistry = {
  ProofOfHumanity,
  CrossChainProofOfHumanity,
  GnosisAMBHelper,
  EthereumAMBBridge,
  CirclesIntegration,
  CirclesHub,
  KlerosLiquid,
} as const;

export type ContractName = keyof typeof contractRegistry;

export type ContractInfo<T extends ContractName> = {
  abi: (typeof contractRegistry)[T]['abi'];
  address: `0x${string}` | undefined;
};

// Helper function to get contract info
export function getContractInfo<T extends ContractName>(
  contractName: T,
  chainId: number
): ContractInfo<T> {
  const contract = contractRegistry[contractName];
  
  if (!(chainId in contract.addresses)) {
    throw new Error(
      `Unsupported chainId ${chainId} for contract ${contractName}. ` +
      `Supported chainIds: ${Object.keys(contract.addresses).join(', ')}`
    );
  }

  const address = contract.addresses[
    chainId as keyof typeof contract.addresses
  ];

  if (!address || !isAddress(address)) {
    throw new Error(
      `Invalid address for contract ${contractName} on chainId ${chainId}: ${address}`
    );
  }

  return {
    abi: contract.abi,
    address,
  };
}
