import multicall3 from "./multicall3";
import klerosLiquid from "./kleros-liquid";
import gnosisAMBHelper from "./gnosis-amb-helper";
import ethereumAMBBridge from "./ethereum-amb-bridge";
import { ChainSet, configSetSelection, configSets } from "contracts";
import abisMainnets from "./mainnets";
import abisTestnets from "./testnets";
import circlesIntegration from "./CirclesIntegration";
// There are different versions of each deployment,
// slight differences but we need to correct abis to each case
// for wagmi to predict txs correctly

const abis =
  configSetSelection.chainSet === ChainSet.MAINNETS
    ? configSetSelection === configSets.mainOld
      ? {
          ProofOfHumanity: abisMainnets.ProofOfHumanityOLD,
          KlerosLiquid: klerosLiquid,
          CrossChainProofOfHumanity: abisMainnets.CrossChainProofOfHumanity,
          GnosisAMBHelper: gnosisAMBHelper,
          EthereumAMBBridge: ethereumAMBBridge,
          Multicall3: multicall3,
          CirclesIntegration: circlesIntegration,
        }
      : {
          //(configSetSelection === configSets.main)?
          ProofOfHumanity: abisMainnets.ProofOfHumanity,
          KlerosLiquid: klerosLiquid,
          CrossChainProofOfHumanity: abisMainnets.CrossChainProofOfHumanity,
          GnosisAMBHelper: gnosisAMBHelper,
          EthereumAMBBridge: ethereumAMBBridge,
          Multicall3: multicall3,
          CirclesIntegration: circlesIntegration,
        }
    : ({
        ProofOfHumanity: abisTestnets.ProofOfHumanity,
        KlerosLiquid: klerosLiquid,
        CrossChainProofOfHumanity: abisTestnets.CrossChainProofOfHumanity,
        GnosisAMBHelper: gnosisAMBHelper,
        EthereumAMBBridge: ethereumAMBBridge,
        Multicall3: multicall3,
        CirclesIntegration: circlesIntegration,
      } as const);

export default abis;
