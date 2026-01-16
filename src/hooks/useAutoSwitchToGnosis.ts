import { useEffect, useRef } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { gnosis } from 'viem/chains';

export function useAutoSwitchToGnosis() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const hasAttemptedSwitch = useRef(false);
  const isSwitching = useRef(false);
  const hasBeenOnGnosis = useRef(false);

  useEffect(() => {
    if (!isConnected || !address || !switchChain) {
      hasAttemptedSwitch.current = false;
      hasBeenOnGnosis.current = false;
      return;
    }

    if (chainId === gnosis.id) {
      hasBeenOnGnosis.current = true;
    }

    if (chainId !== gnosis.id && !hasAttemptedSwitch.current && !hasBeenOnGnosis.current && !isSwitching.current) {
        hasAttemptedSwitch.current = true;
        isSwitching.current = true;
        
        switchChain({ chainId: gnosis.id }, {
            onSuccess: () => {
                isSwitching.current = false;
            },
            onError: () => {
                isSwitching.current = false;
            }
        });
    }
  }, [isConnected, address, chainId, switchChain]);
}
