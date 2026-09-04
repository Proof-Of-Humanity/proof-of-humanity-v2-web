"use client";

import { wagmiAdapter, projectId } from "../config/appkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { gnosis } from "@reown/appkit/networks";
import React, { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { supportedChains } from "../config/chains";
import AutoSwitchNetwork from "components/AutoSwitchNetwork";
import { IpfsProduct, SignupProduct } from "@kleros/kleros-app";
import dynamic from "next/dynamic";

const DynamicAtlasProvider = dynamic(
  () => import("@kleros/kleros-app").then((mod) => mod.AtlasProvider),
  {
    ssr: false,
  },
);

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const metadata = {
  name: "Proof of Humanity",
  description: "Proof of Humanity - Network of Human",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://v2.proofofhumanity.id",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/logo/poh-colored.svg`
      : "https://v2.proofofhumanity.id/logo/poh-colored.svg",
  ],
};

createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedChains as any,
  defaultNetwork: gnosis,
  projectId,
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#FF8A66",
    "--w3m-color-mix": "#20232B",
    "--w3m-color-mix-strength": 12,
    "--w3m-border-radius-master": "3px",
    "--w3m-z-index": 10000,
  },
  features: {
    analytics: true,
  },
});

interface AppKitProviderProps {
  children: ReactNode;
}

export default function AppKitProvider({ children }: AppKitProviderProps) {
  // Add state to handle client-side rendering
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AutoSwitchNetwork />
        <DynamicAtlasProvider
          config={{
            uri: process.env.ATLAS_URI,
            signupProduct: SignupProduct.PohV2,
            ipfsProduct: IpfsProduct.ProofOfHumanity,
            wagmiConfig: wagmiAdapter.wagmiConfig,
          }}
        >
          {mounted && children}
        </DynamicAtlasProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
