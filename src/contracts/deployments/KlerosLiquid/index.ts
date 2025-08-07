import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses = {
  [mainnet.id]: null,
  [sepolia.id]: null,
  [gnosis.id]: null,
  [gnosisChiado.id]: null,
};

export const KlerosLiquid = {
  abi,
  addresses,
};
