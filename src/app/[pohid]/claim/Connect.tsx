import { Web3Button, Web3NetworkSwitch } from '@web3modal/react';
import { SupportedChain, supportedChains } from 'config/chains';
import { Address, useAccount, useChainId } from 'wagmi';

type ConnectProps =
  | { renewalAddress: undefined; renewalChain: undefined }
  | { renewalAddress: Address; renewalChain: SupportedChain };

export default function Connect({ renewalAddress, renewalChain }: ConnectProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <>
      <div className="my-4 flex w-full flex-col text-2xl font-extralight">
        <span>Create your</span>
        <span>
          <strong className="font-semibold uppercase">Proof of Humanity</strong> Profile
        </span>
        <div className="divider mt-4 w-2/3" />
      </div>

      {isConnected ? (
        renewalChain ? (
          renewalAddress !== address?.toLowerCase() ? (
            <span>Connect with corresponding wallet {renewalAddress} to renew</span>
          ) : (
            <>
              <span className="txt mb-2">
                Switch your chain to <strong>{renewalChain.name}</strong> to continue the renewal
              </span>
              <Web3NetworkSwitch />
            </>
          )
        ) : (
          !supportedChains.find((chain) => chain.id === chainId) && (
            <>
              <span className="txt">Switch to supported network</span>
              <Web3NetworkSwitch />
            </>
          )
        )
      ) : (
        <Web3Button />
      )}
    </>
  );
}
