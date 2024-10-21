import { useObservable } from '@legendapp/state/react';
import { useMemo } from 'react';

export const useLoading = (initState: boolean = false, initMessage?: string) => {
  const $state = useObservable([initState, initMessage] as const);
  return useMemo(
    () => ({
      use: $state.use,
      start: (message?: string) => $state.set([true, message]),
      stop: () => $state.set([false, undefined]),
    }),
    [$state],
  );
};
