import useWagmiWrite from "./useWagmiWrite";
import { Effects, WriteFunctionName } from "./types";

export default function usePOHCirclesWrite<
  F extends WriteFunctionName<"CirclesIntegration">,
>(functionName: F, effects?: Effects) {
  return useWagmiWrite("CirclesIntegration", functionName, effects);
}
