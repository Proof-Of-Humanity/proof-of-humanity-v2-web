import { gnosis, gnosisChiado, sepolia } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [sepolia.id]: "0xbe372A981fCFa743C02C7ddeee728e5eD74Ea11E",
  [gnosis.id]: "0xD464f440aC0944C1cEA5bD82fCC8dc4660630E57",
  [gnosisChiado.id]: "0x3Bc210D458095f9E8c704951290a984f2fbF42EA",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
