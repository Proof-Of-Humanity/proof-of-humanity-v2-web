import IntegrationHeader from "components/Integrations/IntegrationHeader";
import { Integration } from "types/integrations";
import { getAirdropContractData } from "data/airdrop";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado } from "viem/chains";
import ClaimSection from "./ClaimSection";
import CheckCircleIcon from "icons/components/CheckCircle";

const HUMANITY_SUBCOURT_ID = 1n;

export default async function PnkAirdrop({ integration }: { integration: Integration }) {
  const chainId = configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis.id : gnosisChiado.id;

    const contractData = await getAirdropContractData(chainId);
    
    return (
      <div className="flex flex-col w-full md:w-10/12 space-y-8">
        <div className="paper">
          <IntegrationHeader integration={integration} />
          <div className="flex flex-col justify-center items-center px-4 py-2 md:px-8 md:py-4 space-y-4">
            <div className="w-full max-w-[1095px] mx-auto p-[1px] rounded-[30px] bg-gradient-to-br from-[#F9BFCE] to-[#BE75FF]">
              <div className="flex flex-col lg:flex-row rounded-[29px] bg-primaryBackground">
                <div className="flex-1 p-6 lg:p-8">
                  <h2 className="text-primaryText text-2xl font-semibold mb-4">Claim & Stake your PNK airdrop</h2>
                  <div className="mb-4">
                    <p className="text-secondaryText text-sm mb-2">To qualify, you must be an included profile.</p>
                    <p className="text-secondaryText text-sm mb-6">Claim & Stake your airdrop on the Humanity court. Deadline: December 31, 2025.</p>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-1">
                        <CheckCircleIcon width={16} height={16} className="flex-shrink-0 fill-purple" />
                      </div>
                      <span>Claim your PNK tokens</span>
                    </div>
                    <div className="flex items-center text-primaryText text-base">
                      <div className="flex-shrink-0 mr-1">
                        <CheckCircleIcon width={16} height={16} className="flex-shrink-0 fill-purple" />
                      </div>
                      <span>Get additional PNK by staking:</span>
                    </div>
                  </div>
                  <div className="text-xs text-purple mb-5 ml-2">
                    <div className="flex flex-wrap gap-1">
                      <span>Staking APY: 4% |</span>
                      <span>Coherence Rewards (Humanity court): y PNK + wETH</span>
                    </div>
                    <p className="mt-1 italic font-light">(Values subject to change) The Coherence Rewards depend on how you vote.</p>
                  </div>
                  <div className="text-secondaryText text-sm leading-relaxed">
                    By staking, you'll have the chance to be selected as a juror, earn arbitration fees, receive monthly 
                    rewards through the Juror Incentive Program and become eligible for our next airdrop.
                  </div>
                </div>
                <ClaimSection {...{ amountPerClaim: contractData.amountPerClaim, humanitySubcourtId: HUMANITY_SUBCOURT_ID }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}