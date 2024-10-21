import useWagmiRead from './useWagmiRead';
import { ReadArgs, ReadFunctionName } from './types';

export default function useCCPoHRead<F extends ReadFunctionName<'CrossChainProofOfHumanity'>>(
  functionName: F,
  args?: ReadArgs<'CrossChainProofOfHumanity', F>,
) {
  return useWagmiRead('CrossChainProofOfHumanity', functionName, args);
}
