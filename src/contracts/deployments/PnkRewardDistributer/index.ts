import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [gnosis.id]: "0x",
  [gnosisChiado.id]: "0xB582C9A96D955FCbe9e25212D357D33B9f011d46",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
