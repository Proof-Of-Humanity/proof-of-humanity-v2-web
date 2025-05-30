'use client';
import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
  SIWESession,
} from "@reown/appkit-siwe";
import {
    createSIWEConfig,
    getChainIdFromMessage,
    getAddressFromMessage, 
    formatMessage
} from "@reown/appkit-siwe";
import { createSiweMessage } from "viem/siwe";
import { supportedChains } from "./chains";
import { 
  getNonce as getAtlasNonce, 
  loginUser, 
  fetchUser,
} from "@kleros/kleros-app";
import { atlasGqlClient } from "./atlas";
import { getGlobalWagmiAddress } from "../stores/walletAddressStore";
import { 
  getAppAuthSession, 
  setAppAuthSession, 
  clearAppAuthSession 
} from "../utils/session";

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: supportedChains.map(chain => chain.id),
    statement: "Sign In to POH with Ethereum.",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
    
    const messageToFormat = {
      ...args,
      issuedAt: new Date(),
      exp: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    console.log("[SIWE Debug] createMessage: Message to format:", messageToFormat);

    return formatMessage(messageToFormat,address);
  },
  
  getNonce: async (): Promise<string> => {
    const address = getGlobalWagmiAddress();
    if (!address) {
      throw new Error("No wallet address available for nonce generation. Ensure wallet is connected.");
    }
    try {
      return await getAtlasNonce(atlasGqlClient, address);
    } catch (error) {
      throw new Error("Failed to get nonce from Atlas backend");
    }
  },
  
  getSession: async (): Promise<SIWESession | null> => {
    const appSession = getAppAuthSession();
    console.log("[SIWE Debug] getSession: AppSession:", appSession);
      if (!appSession) {
        return null;
      }
    
    try {
      atlasGqlClient.setHeader('Authorization', `Bearer ${appSession.atlasToken}`);
      await fetchUser(atlasGqlClient);
      return { address: appSession.address, chainId: appSession.chainId };
    } catch (error) {
      clearAppAuthSession();
      return null;
    }
  },
  
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs): Promise<boolean> => {
    let parsedAddress: string;
    let chainIdNum: number;

    try {
      parsedAddress = getAddressFromMessage(message);
      const rawChainIdStr = getChainIdFromMessage(message);
      chainIdNum = parseInt(
        rawChainIdStr.includes(':') ? rawChainIdStr.split(':')[1] : rawChainIdStr,
        10
      );

      if (!parsedAddress || isNaN(chainIdNum)) {
        return false;
      }
    } catch (parseError) {
      return false;
    }

    try {
      const receivedAtlasToken = await loginUser(atlasGqlClient, {
        message,
        signature: signature as `0x${string}`
      });
      
      setAppAuthSession(receivedAtlasToken, parsedAddress, chainIdNum);
      return true;
    } catch (error) {
      clearAppAuthSession(); 
      return false;
    }
  },
  
  signOut: async (): Promise<boolean> => {
    try {
      clearAppAuthSession();
      return true;
    } catch (error) {
      return false;
    }
  },
  sessionRefetchIntervalMs: 10 * 1000,
});