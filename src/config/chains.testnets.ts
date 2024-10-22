import { gnosisChiado, sepolia } from "viem/chains";

export const supportedChains = [sepolia, gnosisChiado];

export const legacyChain = sepolia;

export type SupportedChain = ArrayElement<typeof supportedChains>;

export function nameToChain(name: string): SupportedChain | null {
  switch (name.toLowerCase()) {
    case sepolia.name.toLowerCase():
      return sepolia;
    case gnosisChiado.name.toLowerCase().replace(/ /g, "%20"):
      return gnosisChiado;
    default:
      return null;
    // throw new Error("chain not supported");
  }
}

export function idToChain(id: number): SupportedChain | null {
  switch (id) {
    case sepolia.id:
      return sepolia;
    case gnosisChiado.id:
      return gnosisChiado;
    default:
      return null;
    // throw new Error("chain not supported");
  }
}

export function getForeignChain(chainId: number) {
  switch (chainId) {
    case 10200:
      return 11155111;
    case 11155111:
      return 10200;
    default:
      throw new Error("chain not supported");
  }
}
