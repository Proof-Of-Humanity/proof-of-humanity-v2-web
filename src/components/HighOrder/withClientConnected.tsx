import { Web3Modal } from '@web3modal/react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { supportedChains } from 'config/chains';

const projectId = '9185f693b1bc3d1d3440300c1559a202';

const { publicClient } = configureChains(supportedChains as any, [w3mProvider({ projectId })]);

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
        <Web3Modal themeMode="light" projectId={projectId} ethereumClient={ethereumClient} />
      </>
    );
  };
}
