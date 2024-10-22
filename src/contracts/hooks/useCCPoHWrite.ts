import useWagmiWrite from "./useWagmiWrite";
import { Effects, WriteFunctionName } from "./types";

export default function useCCPoHWrite<
  F extends WriteFunctionName<"CrossChainProofOfHumanity">,
>(functionName: F, effects?: Effects) {
  return useWagmiWrite("CrossChainProofOfHumanity", functionName, effects);
}
