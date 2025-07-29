import { gnosis, gnosisChiado } from "viem/chains";
import { sdk } from "config/subgraph";
import { ChainSet, configSetSelection, Contract } from "contracts";
import abis from "contracts/abis";
import { config as wagmiConfig } from "config/appkit";
import { readContract } from "@wagmi/core";

// Determine whether to use mainnet (gnosis) or testnet (chiado) for Circles subgraph
const circlesChainId =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? gnosis.id
    : gnosisChiado.id;

export interface ProcessedCirclesData {
  walletAddress: string;    
  humanityId: string;       
  linkStatus: "linked" | "expired" | "idle"; 
  humanityStatus: "valid" | "invalid" | "checking"; 
}

export const getProcessedCirclesData = 
  async (address: string): Promise<ProcessedCirclesData> => {
    if (!address) {
      throw new Error("Address is required"); 
    }
    
    try {
      const data = await sdk[circlesChainId].GetCirclesAccountsByaddress({
        address,
        expirationTime: Math.ceil(Date.now() / 1000),
      });
      
      if (!data) {
        throw new Error("Failed to fetch data from Circles subgraph");
      }

      const humanityId = data.registrations?.[0]?.id || data.crossChainRegistrations?.[0]?.id;
      
      if (!humanityId) {
        return {
          walletAddress: "",
          humanityId: "", 
          linkStatus: "idle",
          humanityStatus: "invalid", 
        };
      }
      
      let primaryCircleAccount = null;
      if (data.registrations?.length > 0) {
        primaryCircleAccount = data.registrations?.[0]?.humanity?.circleAccount;
      }

      if (!primaryCircleAccount) {
        const humanityData = await sdk[circlesChainId].GetHumanityWithCircleAccountById({
          humanityId
        });
          if (humanityData?.humanity?.circleAccount) {
            primaryCircleAccount = humanityData.humanity.circleAccount;
          }
        }
      
      if (!primaryCircleAccount) {
        return {
          walletAddress: "",  
          humanityId,
          linkStatus: "idle", 
          humanityStatus: "valid",
        };
      }
      
      const walletAddress = primaryCircleAccount.id as string; 
      const trustExpiryTime = primaryCircleAccount.trustExpiryTime;
      const expiryMs = Number(trustExpiryTime) * 1000; 
      const linkStatus = !isNaN(expiryMs) && expiryMs > Date.now() ? "linked" : "expired";

      return {
        walletAddress, 
        humanityId,
        linkStatus, 
        humanityStatus: "valid", 
      };
    } catch (error) {
      console.error("Error processing Circles data:", error);
      throw error instanceof Error ? error : new Error(String(error)); 
    }
  }

export async function validateCirclesHumanity(
    walletAddress: string,
  ): Promise<boolean> {
      const isHuman = await readContract(wagmiConfig, {
        address: Contract.CirclesHub[circlesChainId],
        abi: abis.CirclesHub,
        functionName: "isHuman",
        args: [walletAddress.trim()],
      });
  
      return isHuman as boolean;
  }     