import { SupportedChainId, supportedChains } from "config/chains";
import { sdk } from "config/subgraph";
import { cache } from "react";
import { MetaEvidenceFile } from "types/docs";
import { ipfsFetch } from "utils/ipfs";

export const getContractData = cache(async (chainId: SupportedChainId) => {
  const contract = await sdk[chainId].Contract();
  return {
    baseDeposit: contract.contract!.baseDeposit,
    humanityLifespan: contract.contract!.humanityLifespan,
    renewalPeriodDuration: contract.contract!.renewalPeriodDuration,
    challengePeriodDuration: contract.contract!.challengePeriodDuration,
    requiredNumberOfVouches: contract.contract!.requiredNumberOfVouches,
    gateways: contract.crossChainGateways,
    arbitrationInfo: {
      ...contract.contract!.latestArbitratorHistory,
      policy: (
        await ipfsFetch<MetaEvidenceFile>(
          contract.contract!.latestArbitratorHistory!.registrationMeta,
        )
      ).fileURI,
    },
  };
});

export type ContractData = Awaited<ReturnType<Awaited<typeof getContractData>>>;

export const getContractDataAllChains = cache(async () => {
  const res = await Promise.all(
    supportedChains.map((chain) => getContractData(chain.id)),
  );

  return supportedChains.reduce(
    (acc, chain, i) => ({ ...acc, [chain.id]: res[i] }),
    {} as Record<SupportedChainId, ContractData>,
  );
});
