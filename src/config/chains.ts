import { ChainSet, configSetSelection } from 'contracts';
import { isAddress } from 'viem';
import { gnosis, gnosisChiado, mainnet, sepolia } from 'viem/chains';
import {
  getForeignChain as getForeignChainMain,
  idToChain as idToChainMain,
  legacyChain as legacyChainMain,
  nameToChain as nameToChainMain,
  supportedChains as supportedChainsMain,
} from './chains.mainnets';
import {
  getForeignChain as getForeignChainTest,
  idToChain as idToChainTest,
  legacyChain as legacyChainTest,
  nameToChain as nameToChainTest,
  supportedChains as supportedChainsTest,
} from './chains.testnets';

const chainExplorers = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    explorer: 'etherscan.io',
  },
  {
    id: 100,
    name: 'Gnosis Chain',
    explorer: 'gnosisscan.io',
  },
  {
    id: 10200,
    name: 'Gnosis Chiado',
    explorer: 'gnosis-chiado.blockscout.com',
  },
  {
    id: 11155111,
    name: 'Sepolia',
    explorer: 'sepolia.etherscan.io',
  },
];

function getExplorerUrl(chainId: number): string {
  const chain = chainExplorers.find((c) => c.id === chainId);
  return chain ? chain.explorer : '';
}

export function shortenAddress(address: `0x${string}`, chars = 4): string {
  if (!isAddress(address)) throw Error(`Invalid 'address' parameter '${address}'.`);

  return `${address.substring(0, chars)}..${address.substring(42 - chars)}`;
}

export const explorerLink = (address: string, chain: SupportedChain) =>
  `https://${getExplorerUrl(chain.id)}/address/${address}`;

export const supportedChains =
  configSetSelection.chainSet === ChainSet.MAINNETS ? supportedChainsMain : supportedChainsTest;

export const defaultChain = supportedChains[0];

export const legacyChain =
  configSetSelection.chainSet === ChainSet.MAINNETS ? legacyChainMain : legacyChainTest;

export type SupportedChain = ArrayElement<typeof supportedChains>;
export type SupportedChainId = SupportedChain['id'];

export function nameToChain(name: string): SupportedChain | null {
  return configSetSelection.chainSet === ChainSet.MAINNETS
    ? nameToChainMain(name)
    : nameToChainTest(name);
}

export function idToChain(id: number): SupportedChain | null {
  return configSetSelection.chainSet === ChainSet.MAINNETS ? idToChainMain(id) : idToChainTest(id);
}

export function paramToChain(param: string): SupportedChain | null {
  if (nameToChain(param)) return nameToChain(param);
  else return idToChain(+param);
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
      throw new Error('chain not supported');
  }
}

export function getForeignChain(chainId: number) {
  return configSetSelection.chainSet === ChainSet.MAINNETS
    ? getForeignChainMain(chainId)
    : getForeignChainTest(chainId);
}
