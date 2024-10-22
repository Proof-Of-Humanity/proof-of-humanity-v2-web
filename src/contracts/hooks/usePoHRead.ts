import useWagmiRead from "./useWagmiRead";
import { ReadArgs, ReadFunctionName } from "./types";

export default function usePoHRead<
  F extends ReadFunctionName<"ProofOfHumanity">,
>(functionName: F, args?: ReadArgs<"ProofOfHumanity", F>) {
  return useWagmiRead("ProofOfHumanity", functionName, args);
}
