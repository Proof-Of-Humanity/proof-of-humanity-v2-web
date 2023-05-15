import { PoHContract } from "enums/PoHContract";
import { BaseContract } from "ethers";
import { useEffect, useState } from "react";
import { CONTRACT, SupportedContract } from "constants/contracts";
import {
  CrossChainProofOfHumanity,
  GroupCurrencyToken,
  IHUB,
  KlerosLiquid,
  PoHTokenManager,
  ProofOfHumanity,
  Token,
  Token__factory,
} from "generated/contracts";
import useWeb3 from "./useWeb3";

const useContract = <T extends SupportedContract>(
  pohContract: PoHContract,
  onlyNetwork: boolean = false
) => {
  const { account, chainId, library } = useWeb3(onlyNetwork);
  const [contract, setContract] = useState<T | null>(null);

  useEffect(() => {
    (async () => {
      setContract(
        library && chainId
          ? (new BaseContract(
              CONTRACT[pohContract][chainId],
              CONTRACT[pohContract].ABI,
              account ? await library.getSigner(account) : library
            ) as T)
          : null
      );
    })();
  }, [library, chainId, account]);

  return contract;
};

export default useContract;

export const useProofOfHumanity = (onlyNetwork = false) =>
  useContract<ProofOfHumanity>(PoHContract.PROOF_OF_HUMANITY, onlyNetwork);

export const useCrossChainPoH = () =>
  useContract<CrossChainProofOfHumanity>(PoHContract.CROSS_CHAIN_POH);

export const useKlerosLiquid = () =>
  useContract<KlerosLiquid>(PoHContract.ARBITRATOR, true);

export const useHub = () => useContract<IHUB>(PoHContract.HUB, true);

export const useGroupCurrencyToken = (onlyNetwork = false) =>
  useContract<GroupCurrencyToken>(
    PoHContract.GROUP_CURRENCY_TOKEN,
    onlyNetwork
  );

export const usePoHTokenManager = (onlyNetwork = false) =>
  useContract<PoHTokenManager>(PoHContract.POH_TOKEN_MANAGER, onlyNetwork);

export const useToken = (address: string, onlyNetwork = false) => {
  const { account, library } = useWeb3(onlyNetwork);
  const [contract, setContract] = useState<Token | null>(null);

  useEffect(() => {
    (async () => {
      setContract(
        library
          ? Token__factory.connect(
              address,
              account ? await library.getSigner(account) : library
            )
          : null
      );
    })();
  }, [library, account]);

  return contract;
};
