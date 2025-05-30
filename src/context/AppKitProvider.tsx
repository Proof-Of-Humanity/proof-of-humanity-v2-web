'use client'

import { wagmiAdapter, projectId } from '../config/appkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'
import React, { type ReactNode, useEffect, useState } from 'react'
import { WagmiProvider, useAccount } from 'wagmi'
import { supportedChains } from '../config/chains'
import { siweConfig } from '../config/swieConfig'
import { setGlobalWagmiAddress } from '../stores/walletAddressStore'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Initialize AppKit outside the component
createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedChains as any,
  defaultNetwork: mainnet,
  projectId,
  features: {
    analytics: true,
  },
  siweConfig: siweConfig,
});

interface AppKitProviderProps {
  children: ReactNode
}

function WalletEffects() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setGlobalWagmiAddress(address);
    } else {
      setGlobalWagmiAddress(null);
    }
  }, [address, isConnected]);

  return null;
}

export default function AppKitProvider({ children }: AppKitProviderProps) {
  // Add state to handle client-side rendering
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletEffects />
        {mounted && children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 