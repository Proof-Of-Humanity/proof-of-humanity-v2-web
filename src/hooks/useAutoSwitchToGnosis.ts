import { useEffect, useRef } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { gnosis } from 'viem/chains';

const STORAGE_KEY = 'poh-autoswitch-gnosis-prompted';

export function useAutoSwitchToGnosis() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isConnected) return;
    const hasPrompted = sessionStorage.getItem(STORAGE_KEY);
    
    if (!hasPrompted && !hasRun.current) {
        if (chainId !== gnosis.id) {
            hasRun.current = true;
            sessionStorage.setItem(STORAGE_KEY, 'true');
            switchChain({ chainId: gnosis.id });
        } else {
             // If already connected to Gnosis, mark as handled so we don't switch them back if they manually switch to Eth later
             sessionStorage.setItem(STORAGE_KEY, 'true');
        }
    }
  }, [isConnected, chainId, switchChain]);
}
