import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [gnosis.id]: undefined,
  [gnosisChiado.id]: "0x7562C66dB28e397c81d1E6d7645B59D308dEda46" as const,
};

export const CirclesIntegration = {
  abi,
  addresses,
};
