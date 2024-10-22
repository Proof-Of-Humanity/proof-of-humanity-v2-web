import useWagmiWrite from "./useWagmiWrite";
import { Effects, WriteFunctionName } from "./types";

export default function useRelayWrite<
  F extends WriteFunctionName<"EthereumAMBBridge">,
>(functionName: F, effects?: Effects) {
  return useWagmiWrite("EthereumAMBBridge", functionName, effects);
}
