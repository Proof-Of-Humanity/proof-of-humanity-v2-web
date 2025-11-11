import { gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [gnosis.id]: "0xf49aB03E980BD27ecf9352cAF4A65921DD70a554" as const,
  [gnosisChiado.id]: "0x7562C66dB28e397c81d1E6d7645B59D308dEda46" as const,
};

export const CirclesIntegration = {
  abi,
  addresses,
};
