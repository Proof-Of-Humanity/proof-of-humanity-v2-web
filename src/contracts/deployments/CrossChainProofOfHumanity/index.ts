import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import { configSetSelection, ChainSet } from "../../config";
import abi from "./abi";

const addresses = 
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? {
        [mainnet.id]: "0xa478095886659168E8812154fB0DE39F103E74b2",
        [gnosis.id]: "0x16044E1063C08670f8653055A786b7CC2034d2b0",
      }
    : {
        [sepolia.id]: "0x5142177398E94ce45b19c59cBA5d3d71a1c34202",
        [gnosisChiado.id]: "0xBFb98b8F785dE02F35e4eAa8b83a4c9390f75f99",
      };

const creationBlockNumbers =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? {
        [mainnet.id]: BigInt(20685150),
        [gnosis.id]: BigInt(35846905),
      }
    : {
        [sepolia.id]: BigInt(7460633),
        [gnosisChiado.id]: BigInt(13753852),
      };

export const CrossChainProofOfHumanity = {
  abi,
  addresses,
  creationBlockNumbers,
};