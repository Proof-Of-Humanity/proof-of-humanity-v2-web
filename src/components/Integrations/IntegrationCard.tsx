"use client";

import Image from "next/image";
import {useIsDarkMode } from "hooks/useDarkMode";
import { useRouter } from "next/navigation";
import { Integration } from "types/integrations";

interface IntegrationCardProps {
  integration: Integration;
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  const router = useRouter();
  const isDark = useIsDarkMode();
  const src = isDark && integration.darkLogo ? integration.darkLogo : integration.logo;
  const logoWidth = integration.logoWidth || 164;
  const logoHeight = integration.logoHeight || 48;
  
  const handleNavigation = () => {
    router.push(integration.startPath);
  };
  
  return (
    <div className="flex flex-col paper w-full sm:w-[calc(50%-12px)] lg:w-[calc(50%-12px)] xl:w-[570px]">
      <div className="p-4 md:p-6">
        {integration.logo && (
          <div className="mb-4 flex items-center" style={{ height: `${logoHeight}px` }}>
            <Image
              src={src}
              alt={`${integration.name} logo`}
              width={logoWidth}
              height={logoHeight}
              style={{ width: "auto", height: "100%", maxHeight: `${logoHeight}px` }}
            />
          </div>
        )}
        <h3 className="text-primaryText">{integration.title}</h3>
        <p className="mb-4 text-sm text-gray-600 text-primaryText break-words">
          {integration.description}
        </p>

        <button 
          className="text-xs btn-main gradient px-6 py-3 dark:hover:bg-opacity-80 w-full sm:w-auto"
          aria-label={`Start connecting your ${integration.name}`}
          onClick={handleNavigation}
        >
          {integration.buttonText}
        </button>
      </div>
    </div>
  );
} 