declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAINNET_RPC: string;
      GNOSIS_RPC: string;
      CHIADO_RPC: string;
      SEPOLIA_RPC: string;
      FILEBASE_TOKEN: string;
      DATALAKE_URL: string;
      DATALAKE_KEY: string;
      LOGTAIL_SOURCE_TOKEN: string;
      REACT_APP_IPFS_GATEWAY: string;
      DEPLOYED_APP: string;
    }
  }
}

export {};
