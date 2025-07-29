import useWagmiRead from "./useWagmiRead";
import { ReadArgs, ReadFunctionName } from "./types";

export default function usePOHCirclesRead<
  F extends ReadFunctionName<"CirclesIntegration">,
>(functionName: F, args?: ReadArgs<"CirclesIntegration", F>) {
  return useWagmiRead("CirclesIntegration", functionName, args);
}
