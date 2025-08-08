import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [gnosis.id]: "0x",
  [gnosisChiado.id]: "0x7F0B161C81416b61E20Ab93BC3b184Bb025c28cc",
};

export const PnkRewardDistributer = {
  abi,
  addresses,
};
