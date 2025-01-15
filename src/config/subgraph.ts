import { getSdk } from "generated/graphql";
import { GraphQLClient } from "graphql-request";
import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";
import { SupportedChainId } from "./chains";

export type sdkReturnType = ReturnType<typeof getSdk>;
export type queryType = keyof sdkReturnType;
export type queryReturnType<Q extends queryType> = Record<
  SupportedChainId,
  Awaited<ReturnType<sdkReturnType[Q]>>
>;

export const subgraph_url = {
  [mainnet.id]: process.env.MAINNET_SUBGRAPH_URL ?? throw new Error('MAINNET_SUBGRAPH_URL not set'),
  [gnosis.id]: process.env.GNOSIS_SUBGRAPH_URL ?? throw new Error('GNOSIS_SUBGRAPH_URL not set'),
  [sepolia.id]: process.env.SEPOLIA_SUBGRAPH_URL ?? throw new Error('SEPOLIA_SUBGRAPH_URL not set'),
  [gnosisChiado.id]: process.env.CHIADO_SUBGRAPH_URL ?? throw new Error('CHIADO_SUBGRAPH_URL not set'),
};

export const sdk = {
  [mainnet.id]: getSdk(new GraphQLClient(subgraph_url[mainnet.id])),
  [gnosis.id]: getSdk(new GraphQLClient(subgraph_url[gnosis.id])),
  [sepolia.id]: getSdk(new GraphQLClient(subgraph_url[sepolia.id])),
  [gnosisChiado.id]: getSdk(new GraphQLClient(subgraph_url[gnosisChiado.id])),
};
