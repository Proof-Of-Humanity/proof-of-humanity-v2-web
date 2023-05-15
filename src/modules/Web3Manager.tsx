import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { createWeb3ReactRoot } from "@web3-react/core";
import { BrowserProvider } from "ethers";
import { useEffect } from "react";
import { NetworkContextName } from "constants/misc";
import useEagerConnect from "hooks/useEagerConnect";
import useInactiveListener from "hooks/useInactiveListener";
import useSuggestedChain from "hooks/useSuggestedChain";
import useSwitchChain from "hooks/useSwitchChain";
import { network } from "utils/connectors";

const Web3ReactRoot = createWeb3ReactRoot(NetworkContextName);

const Web3Connection = ({ children }: { children: JSX.Element }) => {
  const chainId = useSuggestedChain();

  const { active } = useWeb3React();
  const { error: networkError, activate: activateNetwork } =
    useWeb3React(NetworkContextName);

  const switchChainForNetwork = useSwitchChain(true);

  const triedEager = useEagerConnect();

  useEffect(() => {
    // if (triedEager && !networkActive && !networkError)
    activateNetwork(network);
  }, [activateNetwork]);

  useInactiveListener(!triedEager);

  useEffect(() => {
    if (!chainId) return;
    switchChainForNetwork(chainId);
  }, [chainId, switchChainForNetwork]);

  if (!active && networkError)
    return (
      <div>
        Oops! An unknown error occurred. Please refresh the page, or visit from
        another browser or device
      </div>
    );

  return children;
};

function getLibrary(provider: any) {
  const library = new BrowserProvider(
    provider,
    typeof provider.chainId === "number"
      ? provider.chainId
      : typeof provider.chainId === "string"
      ? parseInt(provider.chainId)
      : "any"
  );
  library.pollingInterval = 15_000;
  return library;
}

const Web3Manager = ({ children }: { children: JSX.Element }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Web3ReactRoot getLibrary={getLibrary}>
      <Web3Connection>{children}</Web3Connection>
    </Web3ReactRoot>
  </Web3ReactProvider>
);

export default Web3Manager;
