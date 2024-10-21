import { getSdk } from 'generated/graphql';
import { GraphQLClient } from 'graphql-request';
import { gnosis, sepolia, gnosisChiado, mainnet } from 'viem/chains';
import { SupportedChainId } from './chains';
import { configSetSelection, configSets } from 'contracts';

export type sdkReturnType = ReturnType<typeof getSdk>;
export type queryType = keyof sdkReturnType;
export type queryReturnType<Q extends queryType> = Record<
  SupportedChainId,
  Awaited<ReturnType<sdkReturnType[Q]>>
>;

export const subgraph_url = {
  [mainnet.id]:
    configSetSelection.id === configSets.main.id
      ? 'https://api.studio.thegraph.com/query/64099/poh-origin-mainnet/v0.0.4'
      : //"https://api.studio.thegraph.com/query/64099/poh-origin-mainnet/version/latest"
        configSetSelection.id === configSets.mainOld.id
        ? 'https://api.studio.thegraph.com/query/64099/proof-of-humanity-mainnet/version/latest'
        : configSetSelection.id === configSets.mainPreAudit.id
          ? 'https://api.studio.thegraph.com/query/64099/pohv2-prod-mainnet/version/latest'
          : '',
  [gnosis.id]:
    configSetSelection.id === configSets.main.id
      ? 'https://api.studio.thegraph.com/query/64099/poh-origin-gnosis/v0.0.4'
      : //"https://api.studio.thegraph.com/query/64099/poh-origin-gnosis/version/latest"
        configSetSelection.id === configSets.mainOld.id
        ? 'https://api.studio.thegraph.com/query/64099/proof-of-humanity-gnosis/version/latest'
        : configSetSelection.id === configSets.mainPreAudit.id
          ? 'https://api.studio.thegraph.com/query/64099/pohv2-prod-gnosis/version/latest'
          : '',
  [sepolia.id]:
    configSetSelection.id === configSets.testOld.id
      ? //"https://api.studio.thegraph.com/query/64099/proof-of-humanity-sepolia-test/v0.0.14" // TESTNETS
        'https://api.studio.thegraph.com/query/64099/proof-of-humanity-sepolia-test/version/latest' // Development
      : configSetSelection.id === configSets.testNew.id
        ? 'https://api.studio.thegraph.com/query/64099/proof-of-humanity-sepolia/version/latest'
        : '',
  [gnosisChiado.id]:
    configSetSelection.id === configSets.testOld.id
      ? //"https://api.goldsky.com/api/public/project_cluh21be5gq0o01u27olk4rwl/subgraphs/proof-of-humanity-chiado/1.0.2/gn" // TESTNETS
        'https://api.goldsky.com/api/public/project_cluh21be5gq0o01u27olk4rwl/subgraphs/proof-of-humanity-chiado/1.0.0/gn' // Development
      : configSetSelection.id === configSets.testNew.id
        ? 'https://api.goldsky.com/api/public/project_cluh21be5gq0o01u27olk4rwl/subgraphs/proof-of-humanity-chiado/1.0.1/gn'
        : '',
};

export const sdk = {
  [mainnet.id]: getSdk(new GraphQLClient(subgraph_url[mainnet.id])),
  [gnosis.id]: getSdk(new GraphQLClient(subgraph_url[gnosis.id])),
  [sepolia.id]: getSdk(new GraphQLClient(subgraph_url[sepolia.id])),
  [gnosisChiado.id]: getSdk(new GraphQLClient(subgraph_url[gnosisChiado.id])),
};
