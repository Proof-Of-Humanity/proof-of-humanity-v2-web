import { ChainId } from "enums/ChainId";
import { PoHContract } from "enums/PoHContract";
import { InterfaceAbi } from "ethers";
import {
  CrossChainProofOfHumanity,
  GroupCurrencyToken,
  IHUB,
  KlerosLiquid,
  PoHTokenManager,
  ProofOfHumanity,
  ProofOfHumanityOld,
  Token,
} from "generated/contracts";
import CrossChainProofOfHumanityABI from "../assets/contracts/CrossChainProofOfHumanity.json";
import GroupCurrencyTokenABI from "../assets/contracts/GroupCurrencyToken.json";
import IHubABI from "../assets/contracts/IHUB.json";
import KlerosLiquidABI from "../assets/contracts/KlerosLiquid.json";
import PoHTokenManagerABI from "../assets/contracts/PoHTokenManager.json";
import ProofOfHumanityABI from "../assets/contracts/ProofOfHumanity.json";
import TokenABI from "../assets/contracts/Token.json";

export const CONTRACT: Record<
  PoHContract,
  { ABI: InterfaceAbi } & Record<number, string>
> = {
  [PoHContract.PROOF_OF_HUMANITY]: {
    ABI: ProofOfHumanityABI,
    // [ChainId.GOERLI]: "0x1B3dE9B7929870e66F8F7FBe8868622Ed3bB0C7c",
    // [ChainId.OPGOERLI]: "0x363Fa6B255B9C3F7E548652075d65c62fE4E46Aa",
    [ChainId.GNOSIS]: "0xa59974FDc4728178D6CdEa305228D4482146f2FD",
  },
  [PoHContract.CROSS_CHAIN_POH]: {
    ABI: CrossChainProofOfHumanityABI,
    // [ChainId.GOERLI]: "0x27c9C7EC137229EEb8E22d9f03084D385b424C78",
    // [ChainId.OPGOERLI]: "0xE4885BDd3dbCa86Bca7A55c0D24F73Bc2A3069EA",
    [ChainId.GNOSIS]: "0x18eb287827FE441f9cF621C5f8be453c6b976E3B",
  },
  [PoHContract.ARBITRATOR]: {
    ABI: KlerosLiquidABI,
    // [ChainId.GOERLI]: "0x08db8fd559cb4e3668f994553871c7eba7c3941a",
    // [ChainId.OPGOERLI]: "0xf22c6c228e4240199b4c645d06903723df606768",
    [ChainId.GNOSIS]: "0x0dca05ce497045d29489b0adc4e82f7d068b3dcf",
  },
  [PoHContract.GROUP_CURRENCY_TOKEN]: {
    ABI: GroupCurrencyTokenABI,
    [ChainId.GNOSIS]: "0x804fC12BD7a0EE26fdb23825132dF2631B135F4c",
  },
  [PoHContract.HUB]: {
    ABI: IHubABI,
    [ChainId.GNOSIS]: "0x1b1938b88f98aac56ae6d5beeb72abd6b858061c",
  },
  [PoHContract.TOKEN]: {
    ABI: TokenABI,
  },
  [PoHContract.POH_TOKEN_MANAGER]: {
    ABI: PoHTokenManagerABI,
    [ChainId.GNOSIS]: "0xfc81de412e3bf2d3ef25c341bc0b0e2717ae9efb",
  },
};

export type SupportedContract =
  | ProofOfHumanity
  | ProofOfHumanityOld
  | CrossChainProofOfHumanity
  | Token
  | GroupCurrencyToken
  | IHUB
  | KlerosLiquid
  | PoHTokenManager;
