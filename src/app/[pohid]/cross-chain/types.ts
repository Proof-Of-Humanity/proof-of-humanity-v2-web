import type { Hash, TransactionReceipt } from "viem";

export const RELAY_MODE_MANUAL_SIGNATURES = "manual-signatures";
export const RELAY_MODE_WAIT_ONLY = "wait-only";

export type RelayMode =
  | typeof RELAY_MODE_MANUAL_SIGNATURES
  | typeof RELAY_MODE_WAIT_ONLY;

export type OutboundAMBEventName =
  | "UserRequestForSignature"
  | "UserRequestForAffirmation";

export type BridgeStrategy = {
  relayMode: RelayMode;
  outboundEventName: OutboundAMBEventName;
};

export type AMBMessageInfo = {
  messageId: Hash;
  encodedData: `0x${string}`;
  type: OutboundAMBEventName;
};

export type AMBMessageInfoParams = {
  txReceipt: TransactionReceipt;
  sourceChainId: number;
  humanityId: Hash;
};

export type RelayedMessageMatchParams = {
  txReceipt: TransactionReceipt;
  messageId: Hash;
  destinationChainId: number;
};
