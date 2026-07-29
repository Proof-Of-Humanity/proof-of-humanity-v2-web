import { useAppKit } from "@reown/appkit/react";
import { SupportedChain, supportedChains } from "config/chains";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import ActionButton from "components/ActionButton";
import ExternalLink from "components/ExternalLink";

type ConnectProps =
  | { renewalAddress: undefined; renewalChain: undefined }
  | { renewalAddress: Address; renewalChain: SupportedChain };

export default function Connect({
  renewalAddress,
  renewalChain,
}: ConnectProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const modal = useAppKit();
  const isRenewal = !!renewalChain;

  return (
    <div className="flex w-full flex-col items-center py-6 text-center">
      <h1 className="text-primaryText text-2xl font-semibold">
        {isRenewal ? "Renew your" : "Create your"}{" "}
        <span className="text-peach">Proof of Humanity</span> Profile
      </h1>
      <p className="text-secondaryText mt-2 max-w-xl text-sm leading-6">
        Submitting your profile to Proof of Humanity takes an average of 5-10
        minutes, an existing Ethereum account and requires you to record a video
        of yourself talking
      </p>

      {isConnected ? (
        renewalChain ? (
          renewalAddress !== address?.toLowerCase() ? (
            <p className="text-secondaryText mt-10 max-w-xl text-sm leading-6">
              Connect with the corresponding wallet{" "}
              <span className="text-primaryText break-all font-medium">
                {renewalAddress}
              </span>{" "}
              to renew.
            </p>
          ) : (
            <>
              <p className="text-secondaryText mt-10 text-sm">
                Switch your chain to{" "}
                <span className="text-primaryText font-medium">
                  {renewalChain.name}
                </span>{" "}
                to continue the renewal.
              </p>
              <div className="mt-6">
                <appkit-network-button />
              </div>
            </>
          )
        ) : (
          !supportedChains.find((chain) => chain.id === chainId) && (
            <>
              <p className="text-secondaryText mt-10 text-sm">
                Switch to a supported network to continue.
              </p>
              <div className="mt-6">
                <appkit-network-button />
              </div>
            </>
          )
        )
      ) : (
        <>
          <p className="text-secondaryText mt-10 text-sm">
            You don&apos;t have a wallet connected to the website.
          </p>
          <ActionButton
            onClick={() => modal.open()}
            label="Connect Wallet"
            className="mt-6 w-full max-w-xs"
          />
          <p className="text-secondaryText mt-6 text-sm">
            Don&apos;t have a wallet? Click{" "}
            <ExternalLink
              href="https://ethereum.org/en/wallets/find-wallet/"
              className="text-orange hover:underline"
            >
              here
            </ExternalLink>{" "}
            to learn on how to create one.
          </p>
        </>
      )}
    </div>
  );
}
