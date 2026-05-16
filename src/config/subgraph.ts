import { getSdk } from "generated/graphql";
import { GraphQLClient } from "graphql-request";
import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

export const subgraph_url = {
  [mainnet.id]: process.env.MAINNET_SUBGRAPH_URL,
  [gnosis.id]: process.env.GNOSIS_SUBGRAPH_URL,
  [sepolia.id]: process.env.SEPOLIA_SUBGRAPH_URL,
  [gnosisChiado.id]: process.env.CHIADO_SUBGRAPH_URL,
};

export const sdk = {
  [mainnet.id]: getSdk(new GraphQLClient(subgraph_url[mainnet.id])),
  [gnosis.id]: getSdk(new GraphQLClient(subgraph_url[gnosis.id])),
  [sepolia.id]: getSdk(new GraphQLClient(subgraph_url[sepolia.id])),
  [gnosisChiado.id]: getSdk(new GraphQLClient(subgraph_url[gnosisChiado.id])),
};
