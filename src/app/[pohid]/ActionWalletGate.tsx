"use client";

import { useAppKit } from "@reown/appkit/react";
import type { ReactNode } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import type { SupportedChain, SupportedChainId } from "config/chains";
import useWeb3Loaded from "hooks/useWeb3Loaded";

/**
 * Single wallet gate shared by the profile action buttons (Renew + Revoke).
 * Shows one "Connect wallet" / "Switch chain" prompt; once connected on the
 * home chain it renders the actions side by side in one row.
 */
export default function ActionWalletGate({
  homeChain,
  children,
}: {
  homeChain: SupportedChain;
  children: ReactNode;
}) {
  const modal = useAppKit();
  const { isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const web3Loaded = useWeb3Loaded();
  const { switchChain } = useSwitchChain();

  if (!web3Loaded) return null;

  if (!isConnected)
    return (
      <button
        onClick={() => modal.open({ view: "Connect" })}
        className="btn-secondary w-fit min-w-[170px] whitespace-nowrap"
      >
        Connect wallet
      </button>
    );

  if (homeChain.id !== connectedChainId)
    return (
      <button
        onClick={() => switchChain?.({ chainId: homeChain.id })}
        className="btn-secondary min-w-[170px] max-w-full whitespace-nowrap md:w-auto"
      >
        Connect to {homeChain.name}
      </button>
    );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {children}
    </div>
  );
}
