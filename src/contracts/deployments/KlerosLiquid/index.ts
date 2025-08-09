import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> = {
  [mainnet.id]: '0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069',
  [sepolia.id]: '0x90992fb4E15ce0C59aEFfb376460Fda4Ee19C879',
  [gnosis.id]: '0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002',
  [gnosisChiado.id]: '0xD8798DfaE8194D6B4CD6e2Da6187ae4209d06f27',
};

export const KlerosLiquid = {
  abi,
  addresses,
};
