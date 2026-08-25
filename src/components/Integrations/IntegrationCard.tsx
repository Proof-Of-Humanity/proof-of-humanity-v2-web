"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Integration } from "types/integrations";

interface IntegrationCardProps {
  integration: Integration;
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  const router = useRouter();
  const lightSrc = integration.logo;
  const darkSrc = integration.darkLogo || integration.logo;
  const logoWidth = integration.logoWidth || 164;
  const logoHeight = integration.logoHeight || 48;

  const handleNavigation = () => {
    router.push(integration.startPath);
  };

  return (
    <div className="paper flex w-full flex-col">
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          {integration.logo && (
            <div
              className="flex items-center"
              style={{ height: `${logoHeight}px` }}
            >
              <Image
                src={lightSrc}
                alt={`${integration.name} logo`}
                width={logoWidth}
                height={logoHeight}
                className="dark:hidden"
                style={{
                  width: "auto",
                  height: "100%",
                  maxHeight: `${logoHeight}px`,
                }}
              />
              <Image
                src={darkSrc}
                alt={`${integration.name} logo`}
                width={logoWidth}
                height={logoHeight}
                className="hidden dark:block"
                style={{
                  width: "auto",
                  height: "100%",
                  maxHeight: `${logoHeight}px`,
                }}
              />
            </div>
          )}
          {integration.statusLabel && (
            <span className="text-status-registered border-status-registered/40 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
              <span className="bg-status-registered h-1.5 w-1.5 rounded-full" />
              {integration.statusLabel}
            </span>
          )}
        </div>
        <h3 className="text-primaryText font-semibold">{integration.title}</h3>
        <p className="text-primaryText mb-4 break-words text-sm">
          {integration.description}
        </p>

        <button
          className="btn-primary mt-auto w-full self-start px-5 py-2.5 text-sm dark:hover:bg-opacity-80 sm:w-auto"
          aria-label={`Start connecting your ${integration.name}`}
          onClick={handleNavigation}
        >
          {integration.buttonText}
        </button>
      </div>
    </div>
  );
}
