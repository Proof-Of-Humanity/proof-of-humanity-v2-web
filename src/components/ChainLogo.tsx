"use client";

import { SVGProps } from "react";
import { mainnet, sepolia, gnosis, gnosisChiado } from "viem/chains";
import EthTokenIcon from "icons/EthToken.svg";
import GnosisTokenIcon from "icons/GnosisToken.svg";

interface ChainLogoProps extends SVGProps<any> {
  chainId: number;
}

const ChainLogo: React.FC<ChainLogoProps> = ({ chainId, ...props }) => {
  switch (chainId) {
    case mainnet.id:
    case sepolia.id:
      return <EthTokenIcon {...props} />;
    case gnosis.id:
    case gnosisChiado.id:
      return <GnosisTokenIcon {...props} />;
    default:
      throw new Error("chain not supported");
  }
};

export default ChainLogo;
