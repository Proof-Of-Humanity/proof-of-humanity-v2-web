import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { supportedChains, getChainTransport } from "./chains";

export const projectId = process.env.WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const transports = Object.fromEntries(
  supportedChains.map((chain) => [
    [chain.id],
    getChainTransport(Number(chain.id)),
  ]),
);

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: supportedChains as any,
  transports,
});

export const config = wagmiAdapter.wagmiConfig;
