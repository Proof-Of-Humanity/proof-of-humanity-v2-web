import { gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

import {
  RELAY_MODE_MANUAL_SIGNATURES,
  RELAY_MODE_WAIT_ONLY,
  type BridgeStrategy,
} from "./types";

const bridgeStrategies = new Map<string, BridgeStrategy>([
  [
    `${gnosis.id}:${mainnet.id}`,
    {
      relayMode: RELAY_MODE_MANUAL_SIGNATURES,
      outboundEventName: "UserRequestForSignature",
    },
  ],
  [
    `${gnosisChiado.id}:${sepolia.id}`,
    {
      relayMode: RELAY_MODE_MANUAL_SIGNATURES,
      outboundEventName: "UserRequestForSignature",
    },
  ],
  [
    `${mainnet.id}:${gnosis.id}`,
    {
      relayMode: RELAY_MODE_WAIT_ONLY,
      outboundEventName: "UserRequestForAffirmation",
    },
  ],
  [
    `${sepolia.id}:${gnosisChiado.id}`,
    {
      relayMode: RELAY_MODE_WAIT_ONLY,
      outboundEventName: "UserRequestForAffirmation",
    },
  ],
]);

/**
 * @notice Looks up the bridge behavior for a source -> destination route.
 * @dev The UI stays chain-agnostic by delegating route-specific relay behavior
 *      to this table.
 * @returns The route strategy describing relay mode and outbound AMB event.
 */
export function getBridgeStrategy(
  sourceChainId: number,
  destinationChainId: number,
): BridgeStrategy {
  const strategy = bridgeStrategies.get(`${sourceChainId}:${destinationChainId}`);

  if (!strategy) {
    throw new Error(
      `Unsupported bridge route ${sourceChainId} -> ${destinationChainId}.`,
    );
  }

  return strategy;
}
