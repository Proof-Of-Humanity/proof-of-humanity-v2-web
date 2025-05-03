import React from 'react';
import Image from 'next/image';
import { Integration } from 'types/integrations';

interface IntegrationHeaderProps {
  integration: Integration;
}

export default function IntegrationHeader({ integration }: IntegrationHeaderProps) {
  return (
    <div className="flex flex-col paper">
      <div className="p-6">
        {integration.logo && (
          <div className="mb-4">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={164}
              height={48}
            />
          </div>
        )}
        <h3 className="text-primaryText">{integration.title}</h3>
        <p className="mb-4 text-sm text-gray-600 whitespace-nowrap text-primaryText">
          {integration.description}
        </p>
      </div>
    </div>
  );
} 