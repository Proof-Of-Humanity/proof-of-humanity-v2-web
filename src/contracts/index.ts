export { contractRegistry, getContractInfo } from "./registry";
export type { ContractName, ContractInfo } from "./registry";
export { ChainSet, configSetSelection } from "./config";

import { contractRegistry } from "./registry";

export const CreationBlockNumber = {
  CrossChainProofOfHumanity: contractRegistry.CrossChainProofOfHumanity.creationBlockNumbers,
};