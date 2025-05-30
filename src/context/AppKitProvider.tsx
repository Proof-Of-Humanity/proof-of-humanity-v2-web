'use client'

import { wagmiAdapter, projectId } from '../config/appkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { supportedChains } from '../config/chains'
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
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DynamicAtlasProvider
            config={{
              uri: process.env.ATLAS_URI,
              product: Products.ProofOfHumanity,
              wagmiConfig: wagmiAdapter.wagmiConfig,
            }}
          >{children}
        </DynamicAtlasProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 