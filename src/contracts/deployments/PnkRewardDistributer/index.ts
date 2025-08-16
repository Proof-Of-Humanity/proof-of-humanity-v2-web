import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [gnosis.id]: "0x",
  [gnosisChiado.id]: "0x717E96A7b3033Ce288E3f1cc479Bba1f0aEB04C5",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
