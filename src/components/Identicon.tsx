'use client';

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

interface IdenticonProps {
  diameter?: number;
  address: string | null | undefined;
}

const Identicon: React.FC<IdenticonProps> = ({ address, diameter }) => (
  <Jazzicon diameter={diameter} seed={address ? jsNumberForAddress(address) : undefined} />
);

export default Identicon;
