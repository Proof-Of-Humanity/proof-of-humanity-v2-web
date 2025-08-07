import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: "0x" as const,
  [sepolia.id]: "0x" as const,
  [gnosis.id]: "0x" as const,
  [gnosisChiado.id]: "0x7562C66dB28e397c81d1E6d7645B59D308dEda46" as const,
};

export const CirclesIntegration = {
  abi,
  addresses,
};
