import { SupportedChainId, supportedChains } from 'config/chains';
import { sdk } from 'config/subgraph';
import { RegistrationQuery } from 'generated/graphql';
import { cache } from 'react';
import { Hash } from 'viem';

export const getRegistrationData = cache(async (id: Hash) => {
  const res = await Promise.all(supportedChains.map((chain) => sdk[chain.id].Registration({ id })));

  return supportedChains.reduce(
    (acc, chain, i) => ({
      ...acc,
      [chain.id]:
        res[i].registration && Date.now() / 1000 < res[i].registration!.expirationTime
          ? res[i].registration
          : null,
    }),
    {} as Record<SupportedChainId, RegistrationQuery['registration']>,
  );
});
