import { useWeb3React } from "@web3-react/core";
import { ChainId } from "enums/ChainId";
import { RPCMethod } from "enums/RpcMethod";
import { Web3ErrorCode } from "enums/Web3ErrorCode";
import { BrowserProvider } from "ethers";
import { useCallback } from "react";
import { CHAIN_SETTING } from "constants/chains";
import { NetworkContextName } from "constants/misc";

const useSwitchChain = (forNetwork = false) => {
  const { chainId, library } = useWeb3React<BrowserProvider>(
    forNetwork ? NetworkContextName : undefined
  );

  const switchChain = useCallback(
    async (targetChain: ChainId) => {
      if (!library || !library?.provider) throw new Error("Provider error");
      if (!targetChain || chainId === targetChain) return false;

      const { provider } = library;
      if (!provider.send)
        throw new Error("Provider can't request changing chain");

      try {
        await provider.send(RPCMethod.SWITCH_CHAIN, {
          chainId: CHAIN_SETTING[targetChain].chainId,
        });

        return true;
      } catch (error) {
        if (error.code !== Web3ErrorCode.CHAIN_NOT_ADDED) throw error;

        await provider.send(RPCMethod.ADD_CHAIN, CHAIN_SETTING[targetChain]);

        try {
          await provider.send(RPCMethod.SWITCH_CHAIN, {
            chainId: CHAIN_SETTING[targetChain].chainId,
          });
        } catch (error) {
          console.error("Added network but could not switch chains", error);
          throw error;
        }

        return true;
      }
    },
    [library]
  );

  return switchChain;
};

export default useSwitchChain;
