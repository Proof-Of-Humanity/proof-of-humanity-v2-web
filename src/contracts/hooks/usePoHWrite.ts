import useWagmiWrite from './useWagmiWrite';
import { Effects, WriteFunctionName } from './types';

export default function usePoHWrite<F extends WriteFunctionName<'ProofOfHumanity'>>(
  functionName: F,
  effects?: Effects,
) {
  return useWagmiWrite('ProofOfHumanity', functionName, effects);
}
