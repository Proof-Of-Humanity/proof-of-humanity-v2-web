import { useCallback } from "react";
import { CHAIN_SETTING, ChainId } from "constants/chains";
import useWeb3 from "./useWeb3";

const useChangeChain = () => {
  const { chainId, account, connector } = useWeb3(false);

  const changeChain = useCallback(
    async (desiredChainId?: ChainId) => {
      if (account && ChainId.GNOSIS === chainId) return false;
      await connector.activate(CHAIN_SETTING[ChainId.GNOSIS]);
      return true;
    },
    [chainId]
  );

  return changeChain;
};

export default useChangeChain;
