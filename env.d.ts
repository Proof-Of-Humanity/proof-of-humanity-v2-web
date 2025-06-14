declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAINNET_RPC: string;
      GNOSIS_RPC: string;
      CHIADO_RPC: string;
      SEPOLIA_RPC: string;
      MAINNET_SUBGRAPH_URL: string;
      GNOSIS_SUBGRAPH_URL: string;
      CHIADO_SUBGRAPH_URL: string;
      SEPOLIA_SUBGRAPH_URL: string;
      DATALAKE_URL: string;
      DATALAKE_KEY: string;
      LOGTAIL_SOURCE_TOKEN: string;
      REACT_APP_IPFS_GATEWAY: string;
      DEPLOYED_APP: string;
      WALLET_CONNECT_PROJECT_ID: string;
      ATLAS_URI: string;
    }
  }
}

export {};
