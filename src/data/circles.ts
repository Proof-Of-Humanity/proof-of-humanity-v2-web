import { sdk } from "config/subgraph";
import { cache } from "react";
import { GetCirclesAccountsByaddressQuery } from "generated/graphql";
import { gnosis, gnosisChiado } from "viem/chains";
import { ChainSet, configSetSelection } from "contracts";

// Determine whether to use mainnet (gnosis) or testnet (chiado) for Circles subgraph
const circlesChainId =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? gnosis.id
    : gnosisChiado.id;

export interface ProcessedCirclesData {
  walletAddress: string;
  humanityId: string;
  linkStatus: "idle" | "linked" | "expired";
  humanityStatus: "valid" | "invalid" | "checking";
  error: unknown;
}

/**
 * Fetch and process Circles account registrations for a given Ethereum address.
 * Returns normalized data with wallet address, link status, and humanity status.
 * @param address - Ethereum address to query (case-insensitive).
 */
export const getProcessedCirclesData = 
  async (address: string): Promise<ProcessedCirclesData> => {
    // Early return if no address provided
    if (!address) {
      return { 
        walletAddress: "", 
        humanityId: "",
        linkStatus: "idle", 
        humanityStatus: "checking",
        error: new Error("Address is required") 
      };
    }
    
    try {
      const { data, error } = await getCirclesAccountsByAddress(address);
      
      // Return early if API request failed
      if (error || !data) {
        return { 
          walletAddress: "", 
          humanityId: "",
          linkStatus: "idle", 
          humanityStatus: "checking",
          error 
        };
      }

      const hasRegistrations = data.registrations.length > 0 || data.crossChainRegistrations.length > 0;
      
      // Return early if no registrations found
      if (!hasRegistrations) {
        return {
          walletAddress: "",
          humanityId: "",
          linkStatus: "idle",
          humanityStatus: "invalid",
          error: null 
        };
      }

      // Get the humanity ID from the first available registration
      const humanityId = data.registrations[0]?.id || data.crossChainRegistrations[0]?.id || "";
      
      // Process homechain accounts first, then cross-chain if needed
      const homechainAccounts = data.registrations
        .map((r) => r.circleAccount)
        .filter(Boolean);
        
      const crossChainAccounts = data.crossChainRegistrations
        .map((r) => r.circleAccount)
        .filter(Boolean);
 

      // Prioritize homechain account over cross-chain
      const account = homechainAccounts.length > 0 
        ? homechainAccounts[0] 
        : crossChainAccounts[0];

      if (!account) {
        return {
          walletAddress: "", 
          humanityId,
          linkStatus: "idle", 
          humanityStatus: "valid",
          error: null
        };
      }
      const walletAddress = account.id as string;
      const expiryMs = Number(account.trustExpiryTime) * 1000;
      const linkStatus = expiryMs > Date.now() ? "linked" : "expired";

      return {
        walletAddress, 
        humanityId,
        linkStatus, 
        humanityStatus: "valid",
        error: null
      };
    } catch (error) {
      return {
        walletAddress: "", 
        humanityId: "",
        linkStatus: "idle", 
        humanityStatus: "checking",
        error 
      };
    }
  }

/**
 * Fetch Circles account registrations for a given Ethereum address.
 * Returns an object with data and error properties.
 * @param address - Ethereum address to query (case-insensitive).
 */
export const getCirclesAccountsByAddress = cache(
  async (
    address: string,
  ): Promise<{
    data: GetCirclesAccountsByaddressQuery | null;
    error: unknown;
  }> => {
    if (!address) {
      return { data: null, error: new Error("Address is required") };
    }
    const normalized = address.toLowerCase();
    const data = await sdk[circlesChainId].GetCirclesAccountsByaddress({
      address: normalized,
      expirationTime: Math.ceil(Date.now() / 1000),
    });
    return { data, error: null };
  }
);