'use client'

import { wagmiAdapter, projectId } from '../config/appkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'
import React, { type ReactNode, useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { supportedChains } from '../config/chains'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedChains as any,
  defaultNetwork: mainnet,
  projectId,
  features: {
    analytics: true,
  }
});

interface AppKitProviderProps {
  children: ReactNode
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
        {mounted && children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 