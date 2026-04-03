import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [mainnet.id]: undefined,
  [sepolia.id]: undefined,
  [gnosis.id]: "0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59",
  [gnosisChiado.id]: "0x8448E15d0e706C0298dECA99F0b4744030e59d7d",
};

export const GnosisAMBBridge = {
  abi,
  addresses,
};
