/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export interface PoHTokenManagerInterface extends utils.Interface {
  functions: {
    "addMemberBack()": FunctionFragment;
    "changeGCT(address)": FunctionFragment;
    "changeGovernor(address)": FunctionFragment;
    "changeHub(address)": FunctionFragment;
    "changePoH(address)": FunctionFragment;
    "confirmHuman(address)": FunctionFragment;
    "confirmHumanToken()": FunctionFragment;
    "confirmToken(bytes20)": FunctionFragment;
    "executeGovernorTx(address,bytes)": FunctionFragment;
    "gct()": FunctionFragment;
    "governor()": FunctionFragment;
    "hub()": FunctionFragment;
    "poh()": FunctionFragment;
    "pohIdToToken(bytes20)": FunctionFragment;
    "redeem(address,address,uint256)": FunctionFragment;
    "redeem(address,uint256)": FunctionFragment;
    "redeemMany(address,address[],uint256[])": FunctionFragment;
    "removeMember(bytes20)": FunctionFragment;
    "removedMember(address)": FunctionFragment;
    "setup()": FunctionFragment;
    "tokenToPohId(address)": FunctionFragment;
    "trust(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addMemberBack"
      | "changeGCT"
      | "changeGovernor"
      | "changeHub"
      | "changePoH"
      | "confirmHuman"
      | "confirmHumanToken"
      | "confirmToken"
      | "executeGovernorTx"
      | "gct"
      | "governor"
      | "hub"
      | "poh"
      | "pohIdToToken"
      | "redeem(address,address,uint256)"
      | "redeem(address,uint256)"
      | "redeemMany"
      | "removeMember"
      | "removedMember"
      | "setup"
      | "tokenToPohId"
      | "trust"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addMemberBack",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "changeGCT",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "changeGovernor",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "changeHub",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "changePoH",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "confirmHuman",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "confirmHumanToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "confirmToken",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "executeGovernorTx",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "gct", values?: undefined): string;
  encodeFunctionData(functionFragment: "governor", values?: undefined): string;
  encodeFunctionData(functionFragment: "hub", values?: undefined): string;
  encodeFunctionData(functionFragment: "poh", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pohIdToToken",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem(address,address,uint256)",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeemMany",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<BigNumberish>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "removeMember",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "removedMember",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "setup", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenToPohId",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "trust",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "addMemberBack",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "changeGCT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeGovernor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "changeHub", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "changePoH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "confirmHuman",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "confirmHumanToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "confirmToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeGovernorTx",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "gct", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "governor", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hub", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poh", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pohIdToToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redeem(address,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redeem(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "redeemMany", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removedMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setup", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenToPohId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "trust", data: BytesLike): Result;

  events: {
    "HumanConfirmed(bytes20,address)": EventFragment;
    "MemberAdded(bytes20,address)": EventFragment;
    "MemberRemoved(bytes20)": EventFragment;
    "Redeemed(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "HumanConfirmed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MemberAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MemberRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Redeemed"): EventFragment;
}

export interface HumanConfirmedEventObject {
  pohId: string;
  token: string;
}
export type HumanConfirmedEvent = TypedEvent<
  [string, string],
  HumanConfirmedEventObject
>;

export type HumanConfirmedEventFilter = TypedEventFilter<HumanConfirmedEvent>;

export interface MemberAddedEventObject {
  pohId: string;
  token: string;
}
export type MemberAddedEvent = TypedEvent<
  [string, string],
  MemberAddedEventObject
>;

export type MemberAddedEventFilter = TypedEventFilter<MemberAddedEvent>;

export interface MemberRemovedEventObject {
  pohId: string;
}
export type MemberRemovedEvent = TypedEvent<[string], MemberRemovedEventObject>;

export type MemberRemovedEventFilter = TypedEventFilter<MemberRemovedEvent>;

export interface RedeemedEventObject {
  redeemer: string;
  collateral: string;
  amount: BigNumber;
}
export type RedeemedEvent = TypedEvent<
  [string, string, BigNumber],
  RedeemedEventObject
>;

export type RedeemedEventFilter = TypedEventFilter<RedeemedEvent>;

export interface PoHTokenManager extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PoHTokenManagerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addMemberBack(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeGCT(
      _gct: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeGovernor(
      _governor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeHub(
      _hub: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changePoH(
      _poh: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    confirmHuman(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    confirmHumanToken(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    confirmToken(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeGovernorTx(
      _destination: PromiseOrValue<string>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    gct(overrides?: CallOverrides): Promise<[string]>;

    governor(overrides?: CallOverrides): Promise<[string]>;

    hub(overrides?: CallOverrides): Promise<[string]>;

    poh(overrides?: CallOverrides): Promise<[string]>;

    pohIdToToken(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    "redeem(address,address,uint256)"(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "redeem(address,uint256)"(
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    redeemMany(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>[],
      _wads: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeMember(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removedMember(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    setup(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    tokenToPohId(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    trust(
      _trustee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addMemberBack(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeGCT(
    _gct: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeGovernor(
    _governor: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeHub(
    _hub: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changePoH(
    _poh: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  confirmHuman(
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  confirmHumanToken(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  confirmToken(
    _pohId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeGovernorTx(
    _destination: PromiseOrValue<string>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  gct(overrides?: CallOverrides): Promise<string>;

  governor(overrides?: CallOverrides): Promise<string>;

  hub(overrides?: CallOverrides): Promise<string>;

  poh(overrides?: CallOverrides): Promise<string>;

  pohIdToToken(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  "redeem(address,address,uint256)"(
    _redeemer: PromiseOrValue<string>,
    _collateral: PromiseOrValue<string>,
    _wad: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "redeem(address,uint256)"(
    _collateral: PromiseOrValue<string>,
    _wad: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  redeemMany(
    _redeemer: PromiseOrValue<string>,
    _collateral: PromiseOrValue<string>[],
    _wads: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeMember(
    _pohId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removedMember(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  setup(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  tokenToPohId(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  trust(
    _trustee: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addMemberBack(overrides?: CallOverrides): Promise<void>;

    changeGCT(
      _gct: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    changeGovernor(
      _governor: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    changeHub(
      _hub: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    changePoH(
      _poh: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    confirmHuman(
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    confirmHumanToken(overrides?: CallOverrides): Promise<void>;

    confirmToken(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    executeGovernorTx(
      _destination: PromiseOrValue<string>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    gct(overrides?: CallOverrides): Promise<string>;

    governor(overrides?: CallOverrides): Promise<string>;

    hub(overrides?: CallOverrides): Promise<string>;

    poh(overrides?: CallOverrides): Promise<string>;

    pohIdToToken(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    "redeem(address,address,uint256)"(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    "redeem(address,uint256)"(
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    redeemMany(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>[],
      _wads: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<void>;

    removeMember(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    removedMember(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    setup(overrides?: CallOverrides): Promise<void>;

    tokenToPohId(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    trust(
      _trustee: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "HumanConfirmed(bytes20,address)"(
      pohId?: null,
      token?: null
    ): HumanConfirmedEventFilter;
    HumanConfirmed(pohId?: null, token?: null): HumanConfirmedEventFilter;

    "MemberAdded(bytes20,address)"(
      pohId?: null,
      token?: null
    ): MemberAddedEventFilter;
    MemberAdded(pohId?: null, token?: null): MemberAddedEventFilter;

    "MemberRemoved(bytes20)"(pohId?: null): MemberRemovedEventFilter;
    MemberRemoved(pohId?: null): MemberRemovedEventFilter;

    "Redeemed(address,address,uint256)"(
      redeemer?: null,
      collateral?: null,
      amount?: null
    ): RedeemedEventFilter;
    Redeemed(
      redeemer?: null,
      collateral?: null,
      amount?: null
    ): RedeemedEventFilter;
  };

  estimateGas: {
    addMemberBack(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeGCT(
      _gct: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeGovernor(
      _governor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeHub(
      _hub: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changePoH(
      _poh: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    confirmHuman(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    confirmHumanToken(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    confirmToken(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeGovernorTx(
      _destination: PromiseOrValue<string>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    gct(overrides?: CallOverrides): Promise<BigNumber>;

    governor(overrides?: CallOverrides): Promise<BigNumber>;

    hub(overrides?: CallOverrides): Promise<BigNumber>;

    poh(overrides?: CallOverrides): Promise<BigNumber>;

    pohIdToToken(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "redeem(address,address,uint256)"(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "redeem(address,uint256)"(
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    redeemMany(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>[],
      _wads: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeMember(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removedMember(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setup(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    tokenToPohId(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    trust(
      _trustee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addMemberBack(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeGCT(
      _gct: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeGovernor(
      _governor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeHub(
      _hub: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changePoH(
      _poh: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    confirmHuman(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    confirmHumanToken(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    confirmToken(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeGovernorTx(
      _destination: PromiseOrValue<string>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    gct(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    governor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    hub(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poh(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pohIdToToken(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "redeem(address,address,uint256)"(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "redeem(address,uint256)"(
      _collateral: PromiseOrValue<string>,
      _wad: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    redeemMany(
      _redeemer: PromiseOrValue<string>,
      _collateral: PromiseOrValue<string>[],
      _wads: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeMember(
      _pohId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removedMember(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setup(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    tokenToPohId(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    trust(
      _trustee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}