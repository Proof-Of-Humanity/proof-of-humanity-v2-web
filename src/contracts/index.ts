import { gnosis, gnosisChiado, mainnet, sepolia } from 'viem/chains';

export enum ChainSet {
  MAINNETS,
  TESTNETS,
}

export const configSets = {
  main: { chainSet: ChainSet.MAINNETS, chainSetId: 'main', id: '1' },
  testOld: { chainSet: ChainSet.TESTNETS, chainSetId: 'testOld', id: '2' },
  testNew: { chainSet: ChainSet.TESTNETS, chainSetId: 'testNew', id: '3' },
  mainOld: { chainSet: ChainSet.MAINNETS, chainSetId: 'mainOld', id: '4' },
  mainPreAudit: { chainSet: ChainSet.MAINNETS, chainSetId: 'mainPreAudit', id: '5' },
};

export const configSetSelection =
  process.env.DEPLOYED_APP == 'https://testnets--proof-of-humanity-v2.netlify.app/'
    ? configSets.testOld
    : configSets.main;

export const Contract = {
  ProofOfHumanity:
    configSetSelection.id === configSets.testOld.id
      ? {
          [mainnet.id]: '0x29defF3DbEf6f79ef20d3fe4f9CFa0547acCeC0D', // OLD
          [sepolia.id]: '0x29defF3DbEf6f79ef20d3fe4f9CFa0547acCeC0D', // OLD
          [gnosisChiado.id]: '0x2505C87AA36d9ed18514Ea7473Ac58aeDeb50849', // OLD
          [gnosis.id]: '0x4a594f0e73223c9a1CE0EfC16da92fFaA193a612',
        }
      : configSetSelection.id === configSets.testNew.id
        ? {
            [gnosis.id]: '0x4a594f0e73223c9a1CE0EfC16da92fFaA193a612',
            [mainnet.id]: '0x0D4674De96459e00A101656b799ba016fBc45dC1',
            [sepolia.id]: '0x0D4674De96459e00A101656b799ba016fBc45dC1',
            [gnosisChiado.id]: '0x2F0f39c3CF5cffc0DeACEb69d3fD883734D67687',
          }
        : configSetSelection.id === configSets.main.id
          ? {
              [gnosis.id]: '0xa4AC94C4fa65Bb352eFa30e3408e64F72aC857bc',
              [mainnet.id]: '0xbE9834097A4E97689d9B667441acafb456D0480A',
              [sepolia.id]: '0x',
              [gnosisChiado.id]: '0x',
            }
          : configSetSelection.id === configSets.mainPreAudit.id
            ? {
                [gnosis.id]: '0xECd1823b3087acEE3C77928b1959c08d31A8F20e',
                [mainnet.id]: '0x87c5c294C9d0ACa6b9b2835A99FE0c9A444Aacc1',
                [sepolia.id]: '0x',
                [gnosisChiado.id]: '0x',
              }
            : configSetSelection.id === configSets.mainOld.id
              ? {
                  [gnosis.id]: '0xe6573F65efAbc351b69F9b73ed8e95772698938b',
                  [mainnet.id]: '0x6cbEdC1920090EA4F28A38C1CD61c8D37b2cc323',
                  [sepolia.id]: '0x',
                  [gnosisChiado.id]: '0x',
                }
              : {
                  [mainnet.id]: '0x',
                  [gnosis.id]: '0x',
                  [sepolia.id]: '0x',
                  [gnosisChiado.id]: '0x',
                },
  CrossChainProofOfHumanity:
    configSetSelection.id === configSets.testOld.id
      ? {
          [mainnet.id]: '0xd134748B972A320a73EfDe3AfF7a68718F6bA92c', //OLD
          [sepolia.id]: '0xd134748B972A320a73EfDe3AfF7a68718F6bA92c', //OLD
          [gnosisChiado.id]: '0xBEd896A3DEa0E065F05Ba83Fa63322c7b9d67838', //OLD
          [gnosis.id]: '0x2C692919Da3B5471F9Ac6ae1C9D1EE54F8111f76',
        }
      : configSetSelection.id === configSets.testNew.id
        ? {
            [gnosis.id]: '0x2C692919Da3B5471F9Ac6ae1C9D1EE54F8111f76',
            [mainnet.id]: '0xDb7070C1AE12f83E709FF22c4c51993a570FDF84',
            [sepolia.id]: '0xDb7070C1AE12f83E709FF22c4c51993a570FDF84',
            [gnosisChiado.id]: '0x2f33051DF37Edf2286E3b2B3c7883E1A13D82071',
          }
        : configSetSelection.id === configSets.main.id
          ? {
              [gnosis.id]: '0x16044E1063C08670f8653055A786b7CC2034d2b0',
              [mainnet.id]: '0xa478095886659168E8812154fB0DE39F103E74b2',
              [sepolia.id]: '0x',
              [gnosisChiado.id]: '0x',
            }
          : configSetSelection.id === configSets.mainPreAudit.id
            ? {
                [gnosis.id]: '0xF921b42B541bc53a07067B65207F879c9377bf7F',
                [mainnet.id]: '0xD8D462ac9F3FAD77Af2ae2640fE7F591F1651A2C',
                [sepolia.id]: '0x',
                [gnosisChiado.id]: '0x',
              }
            : configSetSelection.id === configSets.mainOld.id
              ? {
                  [gnosis.id]: '0x6cbEdC1920090EA4F28A38C1CD61c8D37b2cc323',
                  [mainnet.id]: '0xD6F4E9d906CD7736a83e0AFa7EE9491658B4afA7',
                  [sepolia.id]: '0x',
                  [gnosisChiado.id]: '0x',
                }
              : {
                  [mainnet.id]: '0x',
                  [gnosis.id]: '0x',
                  [sepolia.id]: '0x',
                  [gnosisChiado.id]: '0x',
                },
  Multicall3: {
    [mainnet.id]: mainnet.contracts.multicall3.address,
    [sepolia.id]: sepolia.contracts.multicall3.address,
    [gnosis.id]: gnosis.contracts.multicall3.address,
    [gnosisChiado.id]: gnosisChiado.contracts.multicall3.address,
  },
  GnosisAMBHelper: {
    [mainnet.id]: '0x',
    [sepolia.id]: '0x',
    [gnosis.id]: '0x7d94ece17e81355326e3359115D4B02411825EdD',
    [gnosisChiado.id]: '0x3cc500B3c01D04C265c9293cB35BA2Fd8eA6dc1b',
  },
  EthereumAMBBridge: {
    [mainnet.id]: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
    [sepolia.id]: '0xf2546D6648BD2af6a008A7e7C1542BB240329E11',
    [gnosis.id]: '0x',
    [gnosisChiado.id]: '0x',
  },
} as const;

export const CreationBlockNumber = {
  CrossChainProofOfHumanity:
    configSetSelection.id === configSets.testOld.id
      ? {
          [mainnet.id]: 0, //OLD
          [sepolia.id]: BigInt(4640835), //OLD
          [gnosisChiado.id]: BigInt(8944663), //OLD
          [gnosis.id]: 0,
        }
      : configSetSelection.id === configSets.testNew.id
        ? {
            [gnosis.id]: 0,
            [mainnet.id]: 0,
            [sepolia.id]: BigInt(6198860),
            [gnosisChiado.id]: BigInt(10533290),
          }
        : configSetSelection.id === configSets.main.id
          ? {
              [gnosis.id]: BigInt(35846905),
              [mainnet.id]: BigInt(20685150),
              [sepolia.id]: 0,
              [gnosisChiado.id]: 0,
            }
          : configSetSelection.id === configSets.mainPreAudit.id
            ? {
                [gnosis.id]: BigInt(35610817),
                [mainnet.id]: BigInt(20584115),
                [sepolia.id]: 0,
                [gnosisChiado.id]: 0,
              }
            : configSetSelection.id === configSets.mainOld.id
              ? {
                  [gnosis.id]: BigInt(34761332),
                  [mainnet.id]: BigInt(20218936),
                  [sepolia.id]: 0,
                  [gnosisChiado.id]: 0,
                }
              : {
                  [mainnet.id]: 0,
                  [gnosis.id]: 0,
                  [sepolia.id]: 0,
                  [gnosisChiado.id]: 0,
                },
};

export type ContractName = keyof typeof Contract;
