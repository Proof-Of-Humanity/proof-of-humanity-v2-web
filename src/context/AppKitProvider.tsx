'use client'

import { wagmiAdapter, projectId } from '../config/appkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { gnosis, mainnet } from '@reown/appkit/networks'
import React, { useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { supportedChains } from '../config/chains'
import AutoSwitchNetwork from 'components/AutoSwitchNetwork'
import { Products } from '@kleros/kleros-app'
import dynamic from 'next/dynamic'

const DynamicAtlasProvider = dynamic(() => import('@kleros/kleros-app').then(mod => mod.AtlasProvider), {
  ssr: false,
});

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedChains as any,
  defaultNetwork: gnosis,
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
        <AutoSwitchNetwork />
        <DynamicAtlasProvider
            config={{
              uri: process.env.ATLAS_URI,
              product: Products.ProofOfHumanity,
              wagmiConfig: wagmiAdapter.wagmiConfig,
            }}
          >{mounted && children}
        </DynamicAtlasProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 