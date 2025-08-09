import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import { configSetSelection, ChainSet } from "../../config";
import abi from "./abi";

const addresses: Record<number, `0x${string}` | undefined> =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? {
        [mainnet.id]: "0xbE9834097A4E97689d9B667441acafb456D0480A",
        [gnosis.id]: "0xa4AC94C4fa65Bb352eFa30e3408e64F72aC857bc",
      }
    : {
        [sepolia.id]: "0x44297C64e651E07e83215997D89aEE297a0AFebA",
        [gnosisChiado.id]: "0x3DED649Cc1E0a5D67614d6742C4919B10F0Aabe9",
      };

export const ProofOfHumanity = {
  abi,
  addresses,
};