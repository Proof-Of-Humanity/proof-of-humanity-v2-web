import { AddEthereumChainParameter } from "@web3-react/types";
import TestnetLogo from "../assets/svg/SandboxMajor.svg";
import EthereumLogo from "../assets/svg/ethereum.svg";
import GnosisLogo from "../assets/svg/gnosis.svg";

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 4,
  GOERLI = 5,
  GNOSIS = 100,
}

const INFURA_KEY = process.env.INFURA_KEY;

export const RPC_ENDPOINT: { [key in ChainId]: string } = {
  [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [ChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [ChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [ChainId.GNOSIS]: "https://rpc.gnosischain.com/",
};

const ETH: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
};

const xDAI: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
};

export const CHAIN = {
  [ChainId.MAINNET]: {
    NAME: "Mainnet",
    Logo: EthereumLogo,
    RPC: RPC_ENDPOINT[ChainId.MAINNET],
    EXPLORER: "https://etherscan.io",
    CURRENCY: ETH,
  },
  [ChainId.RINKEBY]: {
    NAME: "Rinkeby",
    Logo: TestnetLogo,
    RPC: RPC_ENDPOINT[ChainId.RINKEBY],
    EXPLORER: "https://rinkeby.etherscan.io",
    CURRENCY: ETH,
  },
  [ChainId.GOERLI]: {
    NAME: "Goerli",
    Logo: TestnetLogo,
    RPC: RPC_ENDPOINT[ChainId.GOERLI],
    EXPLORER: "https://goerli.etherscan.io",
    CURRENCY: ETH,
  },
  [ChainId.GNOSIS]: {
    NAME: "Gnosis",
    Logo: GnosisLogo,
    RPC: RPC_ENDPOINT[ChainId.GNOSIS],
    EXPLORER: "https://gnosisscan.io",
    CURRENCY: xDAI,
  },
} as const;

export const chainSetting = (chain: ChainId) =>
  ({
    [chain]: {
      chainId: chain,
      chainName: CHAIN[chain].NAME,
      nativeCurrency: CHAIN[chain].CURRENCY,
      rpcUrls: [CHAIN[chain].RPC],
      blockExplorerUrls: [CHAIN[chain].EXPLORER],
    },
  } as Record<ChainId, AddEthereumChainParameter>);

export const CHAIN_SETTING = {
  ...chainSetting(ChainId.MAINNET),
  ...chainSetting(ChainId.RINKEBY),
  ...chainSetting(ChainId.GNOSIS),
  ...chainSetting(ChainId.GOERLI),
};

export const FALLBACK_CHAIN = ChainId.GOERLI;

export const SUPPORTED_CHAIN_IDS = [
  // ChainId.MAINNET,
  // ChainId.RINKEBY,
  // ChainId.GNOSIS,
  ChainId.GOERLI,
];
