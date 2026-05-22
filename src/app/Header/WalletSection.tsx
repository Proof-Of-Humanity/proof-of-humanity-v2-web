import { useAppKit } from "@reown/appkit/react";
import ChainLogo from "components/ChainLogo";
import { shortenAddress } from "utils/address";

interface WalletSectionProps {
  web3Loaded: boolean;
  isConnected: boolean;
  address?: `0x${string}`;
  chain: { id: number; name: string };
}

const WalletSection = ({
  web3Loaded,
  isConnected,
  address,
  chain,
}: WalletSectionProps) => {
  const modal = useAppKit();

  return (
    <div className="flex items-center">
      {web3Loaded && isConnected && address ? (
        <div className="flex items-center rounded-full border border-white/[0.08] bg-[#2F333D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <button
            className="flex items-center gap-1.5 whitespace-nowrap rounded-l-full px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/5"
            onClick={() => modal.open({ view: "Networks" })}
          >
            <ChainLogo chainId={chain.id} className="h-4 w-4 fill-current" />
            {chain.name.split(" ").at(-1)}
          </button>
          <span className="h-5 w-px bg-white/[0.08]" />
          <button
            className="flex items-center gap-1.5 whitespace-nowrap rounded-r-full px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/5"
            onClick={() => modal.open({ view: "Account" })}
          >
            {shortenAddress(address)}
          </button>
        </div>
      ) : (
        <button
          className="hover:border-orange flex items-center whitespace-nowrap rounded-full border border-white/[0.08] bg-[#2F333D] px-5 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200"
          onClick={() => modal.open({ view: "Connect" })}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default WalletSection;
