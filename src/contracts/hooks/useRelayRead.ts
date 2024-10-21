import useWagmiRead from './useWagmiRead';
import { ReadArgs, ReadFunctionName } from './types';

export default function useRelayRead<F extends ReadFunctionName<'GnosisAMBHelper'>>(
  functionName: F,
  args?: ReadArgs<'GnosisAMBHelper', F>,
) {
  return useWagmiRead('GnosisAMBHelper', functionName, args);
}
