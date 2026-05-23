"use client";

import Image from "next/image";
import { useIsDarkMode } from "hooks/useDarkMode";
import { useRouter } from "next/navigation";
import { Integration } from "types/integrations";

interface IntegrationCardProps {
  integration: Integration;
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  const router = useRouter();
  const isDark = useIsDarkMode();
  const src =
    isDark && integration.darkLogo ? integration.darkLogo : integration.logo;
  const logoWidth = integration.logoWidth || 164;
  const logoHeight = integration.logoHeight || 48;

  const handleNavigation = () => {
    router.push(integration.startPath);
  };

  return (
    <div className="paper flex w-full flex-col">
      <div className="p-4 md:p-6">
        {integration.logo && (
          <div
            className="mb-4 flex items-center"
            style={{ height: `${logoHeight}px` }}
          >
            <Image
              src={src}
              alt={`${integration.name} logo`}
              width={logoWidth}
              height={logoHeight}
              style={{
                width: "auto",
                height: "100%",
                maxHeight: `${logoHeight}px`,
              }}
            />
          </div>
        )}
        <h3 className="text-primaryText">{integration.title}</h3>
        <p className="text-primaryText mb-4 break-words text-sm">
          {integration.description}
        </p>

        <button
          className="btn-primary w-full px-5 py-2.5 text-sm dark:hover:bg-opacity-80 sm:w-auto"
          aria-label={`Start connecting your ${integration.name}`}
          onClick={handleNavigation}
        >
          {integration.buttonText}
        </button>
      </div>
    </div>
  );
}
