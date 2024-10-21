import { cache } from 'react';
import { SupportedChainId } from 'config/chains';
import { sdk } from 'config/subgraph';
import { Hash } from 'viem';
import { Vouch } from 'generated/graphql';

export interface ValidVouch {
  isValid: boolean;
  reason: string | undefined;
}

enum ValidVouchTypes {
  OK,
  NoPersonhood,
  ExpiredPersonhood,
  Vouching,
  ExpiredVouch,
}

const validVouches: Record<ValidVouchTypes, ValidVouch> = {
  [ValidVouchTypes.OK]: { isValid: true, reason: undefined },
  [ValidVouchTypes.NoPersonhood]: { isValid: false, reason: 'No personhood' },
  [ValidVouchTypes.ExpiredPersonhood]: { isValid: false, reason: 'Expired personhood' },
  [ValidVouchTypes.Vouching]: { isValid: false, reason: 'Vouching' },
  [ValidVouchTypes.ExpiredVouch]: { isValid: false, reason: 'Expired vouch' },
};

export const isValidVouch = cache(
  async (chainId: SupportedChainId, pohId: Hash, offChainExpiration: any): Promise<ValidVouch> => {
    const out = await sdk[chainId].HumanityVouch({ id: pohId });
    if (!out.humanity || !out.humanity.registration)
      return validVouches[ValidVouchTypes.NoPersonhood];
    if (Boolean(out.humanity.vouching)) return validVouches[ValidVouchTypes.Vouching];
    if (Number(out.humanity.registration.expirationTime) < Date.now() / 1000)
      return validVouches[ValidVouchTypes.ExpiredPersonhood];
    if (offChainExpiration && Number(offChainExpiration) < Date.now() / 1000)
      return validVouches[ValidVouchTypes.ExpiredVouch];
    return validVouches[ValidVouchTypes.OK];
  },
);

export const isValidOnChainVouch = (vouch: Vouch) => {
  if (!vouch!.from.registration || !vouch!.from.registration.humanity)
    return validVouches[ValidVouchTypes.NoPersonhood];
  if (Boolean(vouch!.from.registration.humanity.vouching))
    return validVouches[ValidVouchTypes.Vouching];
  if (Number(vouch!.from.registration.expirationTime) < Date.now() / 1000)
    return validVouches[ValidVouchTypes.ExpiredPersonhood];
  return validVouches[ValidVouchTypes.OK];
};
