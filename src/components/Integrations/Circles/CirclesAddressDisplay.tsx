import React from 'react';
import CirclesLogo from 'icons/CriclesLogo.svg';
import ExternalLinkIcon from 'icons/ExternalLink.svg';
import { ChainSet, configSetSelection } from 'contracts';

interface CirclesAddressDisplayProps {
  walletAddress: string;
}

export default function CirclesAddressDisplay({ walletAddress }: CirclesAddressDisplayProps) {
  if (!walletAddress) return null;
  
  const isMainnet = configSetSelection.chainSet === ChainSet.MAINNETS;
  const circlesUrl = `https://${isMainnet ? '' : 'staging.'}circles.garden/profile/${walletAddress}`;
  
  return (
    <div className="flex items-center flex-wrap text-primaryText">
      <CirclesLogo className="w-6 h-6 mr-2 flex-shrink-0" />
      <span className="text-secondaryText mr-2 break-all">{walletAddress}</span>
      <a
        href={circlesUrl}
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center text-orange"
        aria-label="View address on Circles website"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
      >
        View on Circles <ExternalLinkIcon className="ml-1 w-4 h-4" />
      </a>
    </div>
  );
} 