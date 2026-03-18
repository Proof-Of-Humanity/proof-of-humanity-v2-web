"use client";
import Image from "next/image";
import { Integration } from "types/integrations";
import { useIsDarkMode } from "hooks/useDarkMode";

interface IntegrationHeaderProps {
  integration: Integration;
}

export default function IntegrationHeader({
  integration,
}: IntegrationHeaderProps) {
  const isDark = useIsDarkMode();
  const src =
    isDark && integration.darkLogo ? integration.darkLogo : integration.logo;
  const logoWidth = integration.logoWidth || 164;
  const logoHeight = integration.logoHeight || 48;

  return (
    <div className="paper flex flex-col">
      <div className="p-4 md:p-6">
        {integration.logo && (
          <div className="mb-4 ml-1">
            <Image
              src={src}
              alt={`${integration.name} logo`}
              width={logoWidth}
              height={logoHeight}
            />
          </div>
        )}
        <h3 className="text-primaryText mt-1 font-semibold">
          {integration.headerTitle || integration.title}
        </h3>
        <p className="text-primaryText mb-4 mt-2 break-words text-sm text-gray-600">
          {integration.headerDescription || integration.description}
        </p>
      </div>
    </div>
  );
}
