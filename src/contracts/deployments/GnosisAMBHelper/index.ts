import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: "0x" as const,
  [sepolia.id]: "0x" as const,
  [gnosis.id]: "0x7d94ece17e81355326e3359115D4B02411825EdD" as const,
  [gnosisChiado.id]: "0x3cc500B3c01D04C265c9293cB35BA2Fd8eA6dc1b" as const,
};

export const GnosisAMBHelper = {
  abi,
  addresses,
};
