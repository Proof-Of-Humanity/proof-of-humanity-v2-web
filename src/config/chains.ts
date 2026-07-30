import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado, mainnet, sepolia } from "@reown/appkit/networks";
import { fallback, http } from "viem";
import {
  getForeignChain as getForeignChainMain,
  idToChain as idToChainMain,
  legacyChain as legacyChainMain,
  nameToChain as nameToChainMain,
  supportedChains as supportedChainsMain,
} from "./chains.mainnets";
import {
  getForeignChain as getForeignChainTest,
  idToChain as idToChainTest,
  legacyChain as legacyChainTest,
  nameToChain as nameToChainTest,
  supportedChains as supportedChainsTest,
} from "./chains.testnets";

const chainExplorers = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    explorer: "etherscan.io",
  },
  {
    id: 100,
    name: "Gnosis Chain",
    explorer: "gnosis.blockscout.com",
  },
  {
    id: 10200,
    name: "Gnosis Chiado",
    explorer: "gnosis-chiado.blockscout.com",
  },
  {
    id: 11155111,
    name: "Sepolia",
    explorer: "sepolia.etherscan.io",
  },
];

function getExplorerUrl(chainId: number): string {
  const chain = chainExplorers.find((c) => c.id === chainId);
  return chain ? chain.explorer : "";
}

export const explorerLink = (address: string, chain: SupportedChain) =>
  `https://${getExplorerUrl(chain.id)}/address/${address}`;

export const supportedChains =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? supportedChainsMain
    : supportedChainsTest;

export const defaultChain = supportedChains[0]!;

export const legacyChain =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? legacyChainMain
    : legacyChainTest;

export type SupportedChain = ArrayElement<typeof supportedChains>;
export type SupportedChainId = SupportedChain["id"];
export type AnySupportedChain =
  | ArrayElement<typeof supportedChainsMain>
  | ArrayElement<typeof supportedChainsTest>;

export function nameToChain(name: string): SupportedChain | null {
  return configSetSelection.chainSet === ChainSet.MAINNETS
    ? nameToChainMain(name)
    : nameToChainTest(name);
}

export function nameToChainAny(name: string): AnySupportedChain | null {
  const normalized = decodeURIComponent(name);
  return nameToChainMain(normalized) ?? nameToChainTest(normalized);
}

export function idToChain(id: number): SupportedChain | null {
  return configSetSelection.chainSet === ChainSet.MAINNETS
    ? idToChainMain(id)
    : idToChainTest(id);
}

export function idToChainAny(id: number): AnySupportedChain | null {
  return idToChainMain(id) ?? idToChainTest(id);
}

export function paramToChain(param: string): SupportedChain | null {
  if (nameToChain(param)) return nameToChain(param);
  else return idToChain(+param);
}

export function paramToChainAny(param: string): AnySupportedChain | null {
  return nameToChainAny(param) ?? idToChainAny(+param);
}

export function getChainRpc(id: number): string {
  switch (id) {
    case mainnet.id:
      return process.env.MAINNET_RPC;
    case gnosis.id:
      return process.env.GNOSIS_RPC;
    case sepolia.id:
      return process.env.SEPOLIA_RPC;
    case gnosisChiado.id:
      return process.env.CHIADO_RPC;
    default:
      throw new Error("chain not supported");
  }
}

export function getChainTransport(id: number) {
  const publicRpc =
    id === mainnet.id
      ? "https://ethereum-rpc.publicnode.com"
      : idToChainAny(id)?.rpcUrls.default.http[0];
  if (!publicRpc) throw new Error("chain not supported");

  return fallback([http(getChainRpc(id)), http(publicRpc)]);
}

export function getForeignChain(chainId: number) {
  return configSetSelection.chainSet === ChainSet.MAINNETS
    ? getForeignChainMain(chainId)
    : getForeignChainTest(chainId);
}
