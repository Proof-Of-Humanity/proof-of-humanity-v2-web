import { gnosis, gnosisChiado } from "viem/chains";
import { sdk } from "config/subgraph";
import { ChainSet, configSetSelection } from "contracts";

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
  error: Error | null;
}

export const getProcessedCirclesData = 
  async (address: string): Promise<ProcessedCirclesData> => {
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
      const data = await sdk[circlesChainId].GetCirclesAccountsByaddress({
        address,
        expirationTime: Math.ceil(Date.now() / 1000),
      });
      
      if (!data) {
        return { 
          walletAddress: "", 
          humanityId: "",
          linkStatus: "idle", 
          humanityStatus: "checking", 
          error: new Error("Failed to fetch data from Circles subgraph")
        };
      }

      const humanityId = data.registrations?.[0]?.id || data.crossChainRegistrations?.[0]?.id;
      
      if (!humanityId) {
        return {
          walletAddress: "",
          humanityId: "", 
          linkStatus: "idle",
          humanityStatus: "invalid", 
          error: null 
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
          error: null
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
        error: null
      };
    } catch (error) {
      console.error("Error processing Circles data:", error);
      return {
        walletAddress: "", 
        humanityId: "",
        linkStatus: "idle", 
        humanityStatus: "checking", 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  }
