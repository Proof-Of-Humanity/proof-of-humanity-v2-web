import { gnosis, mainnet } from "viem/chains";

export const supportedChains = [mainnet, gnosis];

export const legacyChain = mainnet;

export type SupportedChain = ArrayElement<typeof supportedChains>;

export function nameToChain(name: string): SupportedChain | null {
  switch (name.toLowerCase()) {
    case mainnet.name.toLowerCase():
      return mainnet;
    case gnosis.name.toLowerCase():
      return gnosis;
    default:
      return null;
    // throw new Error("chain not supported");
  }
}

export function idToChain(id: number): SupportedChain | null {
  switch (id) {
    case mainnet.id:
      return mainnet;
    case gnosis.id:
      return gnosis;
    default:
      return null;
    // throw new Error("chain not supported");
  }
}

export function getForeignChain(chainId: number) {
  switch (chainId) {
    case 1:
      return 100;
    case 100:
      return 1;
    default:
      throw new Error("chain not supported");
  }
}
