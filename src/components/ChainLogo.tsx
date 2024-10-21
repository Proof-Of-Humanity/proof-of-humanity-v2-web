'use client';

import { SVGProps } from 'react';
import { mainnet, sepolia, gnosis, gnosisChiado } from 'viem/chains';
import MainnetIcon from 'icons/mainnet.svg';
import GnosisIcon from 'icons/gnosis.svg';
import TestnetIcon from 'icons/testnet.svg';

interface ChainLogoProps extends SVGProps<any> {
  chainId: number;
}

const ChainLogo: React.FC<ChainLogoProps> = ({ chainId, ...props }) => {
  switch (chainId) {
    case mainnet.id:
      return <MainnetIcon {...props} />;
    case sepolia.id:
      return <MainnetIcon {...props} />;
    case gnosis.id:
      return <GnosisIcon {...props} />;
    case gnosisChiado.id:
      return <TestnetIcon {...props} />;
    default:
      throw new Error('chain not supported');
  }
};

export default ChainLogo;
