import { useState } from 'react';
import { sdk } from 'api/index';
import { sdkReturnType } from 'api/index';
import useInterval from './useInterval';
import useWeb3 from './useWeb3';

function useIsGraphSynced(block?: number) {
  const [isSynced, setIsSynced] = useState(false);
  const { chainId } = useWeb3();

  useInterval(
    async () => {
      if (!block || !chainId) return;

      const { _meta } = await (sdk[chainId] as sdkReturnType).IsSynced({
        block,
      });

      if (_meta && !_meta.hasIndexingErrors) setIsSynced(true);
    },
    isSynced ? null : 1000,
  );

  return isSynced;
}

export default useIsGraphSynced;
