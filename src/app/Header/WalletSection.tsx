import { useWeb3Modal } from '@web3modal/react';
import ChainLogo from 'components/ChainLogo';
import { shortenAddress } from 'utils/address';

interface WalletSectionProps {
  web3Loaded: boolean;
  isConnected: boolean;
  address?: `0x${string}`;
  chain: { id: number; name: string };
}

const WalletSection = ({ web3Loaded, isConnected, address, chain }: WalletSectionProps) => {
  const modal = useWeb3Modal();

  return (
    <div className="col-span-2 flex flex-wrap items-center gap-y-[12px] justify-self-center md:col-span-1 md:flex md:w-fit md:gap-y-0 md:justify-self-end">
      {web3Loaded && isConnected && address ? (
        <div className="flex">
          <button
            className="centered h-8 rounded-l border-2 border-r-0 border-white/20 bg-white/10 px-2 text-white hover:bg-white/40"
            onClick={() => modal.open({ route: 'SelectNetwork' })}
          >
            <ChainLogo chainId={chain.id} className="mr-1 h-4 w-4 fill-white" />
            {chain.name.split(' ').at(-1)}
          </button>
          <button
            className="centered mr-2 h-8 rounded-r border-2 border-white/50 bg-white/10 px-2 text-white hover:bg-white/40"
            onClick={() => modal.open({ route: 'Account' })}
          >
            {shortenAddress(address)}
          </button>
        </div>
      ) : (
        <button
          className="centered mr-2 h-8 rounded border-2 border-white bg-white/10 px-2 text-white"
          onClick={() => modal.open({ route: 'ConnectWallet' })}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default WalletSection;
