import { Integration } from "types/integrations";
import { getAirdropContractData } from "data/airdrop";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado, sepolia } from "viem/chains";
import PnkAirdropContent from "components/Integrations/Airdrop/PnkAirdropContent";
import { computeGnosisAPY, getHumanityCourtFeeForJuror } from "data/kleros";

export default async function PnkAirdrop({ integration }: { integration: Integration }) {
  const airdropChainId =
      configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis.id : sepolia.id;

  const [contractData, coherenceReward, gnosisApy] = await Promise.all([
    getAirdropContractData(airdropChainId),
    getHumanityCourtFeeForJuror(airdropChainId),
    computeGnosisAPY(),
  ]);

  return <PnkAirdropContent {...{ integration, contractData, airdropChainId, coherenceReward, gnosisApy }} />;
}