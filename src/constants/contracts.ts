import { ContractInterface } from "ethers";
import KlerosLiquidABI from "../assets/contracts/KlerosLiquid.json";
import ProofOfHumanityABI from "../assets/contracts/ProofOfHumanity.json";
import { ChainId } from "./chains";

export enum Contracts {
  PROOF_OF_HUMANITY,
  KLEROS_LIQUID,
}

export const CONTRACT: Record<
  Contracts,
  { ABI: ContractInterface } & Record<number, string>
> = {
  [Contracts.PROOF_OF_HUMANITY]: {
    ABI: ProofOfHumanityABI,
    [ChainId.RINKEBY]: "0x6dCe2a3dE1436E7ffC61f2Dde6A944b4cF13EA3F",
    // [ChainId.MAINNET]: "0x801C5D176A853c19e92A753aA43eab6c65797927",
    [ChainId.GOERLI]: "0x9005d70530957110c3136778AAee66c834264b2E",
    [ChainId.GNOSIS]: "0x31B679253D53A18Eb793e023e7EFCed5160d7fD6",
  },
  [Contracts.KLEROS_LIQUID]: {
    ABI: KlerosLiquidABI,
    [ChainId.RINKEBY]: "0x6e376E049BD375b53d31AFDc21415AeD360C1E70",
    // [ChainId.MAINNET]: "0x6e376E049BD375b53d31AFDc21415AeD360C1E70",
    [ChainId.GOERLI]: "0x1128eD55ab2d796fa92D2F8E1f336d745354a77A",
    [ChainId.GNOSIS]: "0x9de81cf9b4b46046c1a87fdc71ae55566919be64",
  },
};
