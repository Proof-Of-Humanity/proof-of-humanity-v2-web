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
    try {
      const normalized = address.toLowerCase();
      const data = await sdk[circlesChainId].GetCirclesAccountsByaddress({
        address: normalized,
      });
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching Circles accounts:", error);
      return { data: null, error };
    }
  },
); 