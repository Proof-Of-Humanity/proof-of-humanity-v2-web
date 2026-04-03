import { getForeignChain } from "config/chains";
import { decodeEventLog, decodeFunctionData, toFunctionSelector } from "viem";

import crossChainProofOfHumanityAbi from "contracts/deployments/CrossChainProofOfHumanity/abi";
import ethereumAMBBridgeAbi from "contracts/deployments/EthereumAMBBridge/abi";
import gnosisAMBBridgeAbi from "contracts/deployments/GnosisAMBBridge/abi";

import { getBridgeStrategy } from "./bridgeStrategies";
import type {
  AMBMessageInfo,
  AMBMessageInfoParams,
  RelayedMessageMatchParams,
} from "./types";

export const getOutboundAMBEventName = (sourceChainId: number) =>
  getBridgeStrategy(sourceChainId, getForeignChain(sourceChainId))
    .outboundEventName;

const crossChainRelayFunctions = crossChainProofOfHumanityAbi.filter(
  (abiItem) =>
    abiItem.type === "function" &&
    (abiItem.name === "receiveUpdate" || abiItem.name === "receiveTransfer"),
);

const getFunctionSignature = (
  abiItem: (typeof crossChainRelayFunctions)[number],
) => `${abiItem.name}(${abiItem.inputs.map((input) => input.type).join(",")})`;

const crossChainRelaySelectors = crossChainRelayFunctions.map((abiItem) =>
  toFunctionSelector(getFunctionSignature(abiItem)).slice(2).toLowerCase(),
);

/**
 * @notice Extracts the nested CCPoH calldata from an AMB message envelope.
 * @dev Some bridges emit the raw `receiveUpdate`/`receiveTransfer` calldata,
 *      while Chiado/Gnosis wraps that calldata in an AMB envelope. We support
 *      both by looking for the first known CCPoH relay function selector.
 */
const extractCrossChainRelayCallData = (ambEncodedData: `0x${string}`) => {
  const ambEncodedDataBody = ambEncodedData.slice(2).toLowerCase();

  for (const relaySelector of crossChainRelaySelectors) {
    const selectorIndex = ambEncodedDataBody.indexOf(relaySelector);

    if (selectorIndex === -1) {
      continue;
    }

    return `0x${ambEncodedDataBody.slice(selectorIndex)}` as `0x${string}`;
  }

  return ambEncodedData;
};

const decodeOutboundHumanityId = (ambEncodedData: `0x${string}`) => {
  const relayCallData = extractCrossChainRelayCallData(ambEncodedData);
  const decodedRelayCall = decodeFunctionData({
    abi: crossChainProofOfHumanityAbi,
    data: relayCallData,
  });

  return decodedRelayCall.args?.[1];
};

/**
 * @notice Decodes the outbound AMB message from a sending-chain receipt.
 * @dev Returns the bridge message id and encoded payload used later by manual
 *      relay flows and update reconciliation.
 */
export function getAMBMessageInfo({
  txReceipt,
  sourceChainId,
  humanityId,
}: AMBMessageInfoParams): AMBMessageInfo | null {
  const eventName = getOutboundAMBEventName(sourceChainId);
  const eventAbi =
    eventName === "UserRequestForSignature"
      ? gnosisAMBBridgeAbi
      : ethereumAMBBridgeAbi;

  const decodeMatches = (
    log: AMBMessageInfoParams["txReceipt"]["logs"][number],
  ) => {
    try {
      const decoded = decodeEventLog({
        abi: eventAbi,
        data: log.data,
        topics: log.topics,
      });

      return decoded.eventName === eventName;
    } catch {
      return false;
    }
  };

  for (const log of txReceipt.logs) {
    if (!decodeMatches(log)) {
      continue;
    }

    const decoded = decodeEventLog({
      abi: eventAbi,
      data: log.data,
      topics: log.topics,
    });
    const decodedArgs = decoded.args as {
      messageId: AMBMessageInfo["messageId"];
      encodedData: AMBMessageInfo["encodedData"];
    };

    try {
      const outboundHumanityId = decodeOutboundHumanityId(
        decodedArgs.encodedData,
      );

      if (
        typeof outboundHumanityId === "string" &&
        outboundHumanityId.toLowerCase() === humanityId.toLowerCase()
      ) {
        return {
          messageId: decodedArgs.messageId,
          encodedData: decodedArgs.encodedData,
          type: eventName,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * @notice Checks whether a receiving-chain receipt relayed the given bridge
 *         message.
 */
export function hasRelayedMessage({
  txReceipt,
  messageId,
}: RelayedMessageMatchParams) {
  for (const log of txReceipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: ethereumAMBBridgeAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "RelayedMessage") {
        continue;
      }

      const decodedArgs = decoded.args as {
        messageId: `0x${string}`;
      };

      if (decodedArgs.messageId === messageId) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}
