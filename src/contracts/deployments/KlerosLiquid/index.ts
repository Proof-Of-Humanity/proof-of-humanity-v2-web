import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: "0x" as const,
  [sepolia.id]: "0x" as const,
  [gnosis.id]: "0x" as const,
  [gnosisChiado.id]: "0x" as const,
};

export const KlerosLiquid = {
  abi,
  addresses,
};
