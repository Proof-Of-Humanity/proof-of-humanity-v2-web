import { gnosis, gnosisChiado, sepolia } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [sepolia.id]: "0xbe372A981fCFa743C02C7ddeee728e5eD74Ea11E",
  [gnosis.id]: "0x906113115C0A691F7E78dB91083EFfCD415Cb978",
  [gnosisChiado.id]: "0x3Bc210D458095f9E8c704951290a984f2fbF42EA",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
