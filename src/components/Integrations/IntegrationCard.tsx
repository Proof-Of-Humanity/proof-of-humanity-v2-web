"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Integration } from "types/integrations";

interface IntegrationCardProps {
  integration: Integration;
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  const router = useRouter();
  
  const handleNavigation = () => {
    router.push(integration.startPath);
  };
  
  return (
    <div className="flex flex-col paper w-[570px]">
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

        <button 
          className="text-xs btn-main gradient px-6 py-3 dark:hover:bg-opacity-80"
          aria-label={`Start connecting your ${integration.name}`}
          onClick={handleNavigation}
        >
          {integration.buttonText}
        </button>
      </div>
    </div>
  );
} 