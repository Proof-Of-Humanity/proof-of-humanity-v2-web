import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [gnosis.id]: "0x",
  [gnosisChiado.id]: "0x3Bc210D458095f9E8c704951290a984f2fbF42EA",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
