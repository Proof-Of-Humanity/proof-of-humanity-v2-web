export enum ChainSet {
  MAINNETS,
  TESTNETS,
}

export const configSets = {
  main: { chainSet: ChainSet.MAINNETS, chainSetId: "main" },
  testnet: { chainSet: ChainSet.TESTNETS, chainSetId: "testnet" },
};

export const configSetSelection =
  process.env.DEPLOYED_APP ==
    "https://testnets--proof-of-humanity-v2.netlify.app"
    ? configSets.testnet
    : configSets.main;
