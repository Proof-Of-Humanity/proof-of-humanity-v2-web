import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  // Not deployed on Ethereum Mainnet
  [mainnet.id]: undefined,
  // Not deployed on Sepolia
  [sepolia.id]: undefined,
  [gnosis.id]: "0x7d94ece17e81355326e3359115D4B02411825EdD",
  [gnosisChiado.id]: "0x3cc500B3c01D04C265c9293cB35BA2Fd8eA6dc1b",
};

export const GnosisAMBHelper = {
  abi,
  addresses,
};
