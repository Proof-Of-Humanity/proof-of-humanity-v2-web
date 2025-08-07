import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: "0x" as const,
  [sepolia.id]: "0x" as const,
  [gnosis.id]: "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8" as const,
  [gnosisChiado.id]: "0x7369766AB350FaC58091eAF91D544DD1BeaC6250" as const,
};

export const CirclesHub = {
  abi,
  addresses,
};
