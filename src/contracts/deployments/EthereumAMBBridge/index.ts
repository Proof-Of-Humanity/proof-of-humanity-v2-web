import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: "0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e" as const,
  [sepolia.id]: "0xf2546D6648BD2af6a008A7e7C1542BB240329E11" as const,
  [gnosis.id]: "0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e" as const,
  [gnosisChiado.id]: "0xf2546D6648BD2af6a008A7e7C1542BB240329E11" as const,
};

export const EthereumAMBBridge = {
  abi,
  addresses,
};
