import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { Chain } from 'viem/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { getChainRpc } from 'config/chains';
import useChainParam from 'hooks/useChainParam';

const config = (chosenChain: Chain) =>
  createConfig({
    publicClient: configureChains(
      [chosenChain],
      [jsonRpcProvider({ rpc: (chain) => ({ http: getChainRpc(chain.id) }) })],
    ).publicClient,
  });

export default function withNetworkConnected<T extends JSX.IntrinsicAttributes>(
  Component: React.ComponentType<T>,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const chain = useChainParam();

  return (props: T) => (
    <WagmiConfig config={config(chain as Chain)}>
      <Component {...props} />
    </WagmiConfig>
  );
}
