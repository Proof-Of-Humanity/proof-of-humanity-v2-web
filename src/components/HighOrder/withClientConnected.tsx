import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { supportedChains } from "config/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";

const projectId = process.env.WALLET_CONNECT_PROJECT_ID;

const { publicClient } = configureChains(supportedChains as any, [
  w3mProvider({ projectId }),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains: supportedChains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, supportedChains);

export default function withClientConnected<T extends JSX.IntrinsicAttributes>(
  Component: React.ComponentType<T>,
) {
  return function (props: T) {
    return (
      <>
        <WagmiConfig config={wagmiConfig}>
          <Component {...props} />
        </WagmiConfig>
        <Web3Modal
          themeMode="light"
          projectId={projectId}
          ethereumClient={ethereumClient}
        />
      </>
    );
  };
}
