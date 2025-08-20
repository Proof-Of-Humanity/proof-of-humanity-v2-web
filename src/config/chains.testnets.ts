import { gnosisChiado, sepolia } from "@reown/appkit/networks";

export const supportedChains = [sepolia, gnosisChiado];

export const legacyChain = sepolia;

export type SupportedChain = ArrayElement<typeof supportedChains>;

export function nameToChain(name: string): SupportedChain | null {
  const normalized = decodeURIComponent(name).toLowerCase();
  switch (normalized) {
    case sepolia.name.toLowerCase():
      return sepolia;
    case gnosisChiado.name.toLowerCase():
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
