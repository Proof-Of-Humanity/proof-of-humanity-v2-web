"use client";
import React from "react";
import Image from "next/image";
import cn from "classnames";
import { Integration } from "types/integrations";

interface IntegrationHeaderProps {
  integration: Integration;
  className?: string;
}

export default function IntegrationHeader({
  integration,
  className,
}: IntegrationHeaderProps) {
  const lightSrc = integration.logo;
  const darkSrc = integration.darkLogo || integration.logo;
  const logoWidth = integration.logoWidth || 164;
  const logoHeight = integration.logoHeight || 48;

  return (
    <div
      className={cn(
        "border-stroke bg-whiteBackground flex flex-col rounded-card border dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <div className="p-4 md:p-6">
        {integration.logo && (
          <div className="mb-4 ml-1">
            <Image
              src={lightSrc}
              alt={`${integration.name} logo`}
              width={logoWidth}
              height={logoHeight}
              className="dark:hidden"
            />
            <Image
              src={darkSrc}
              alt={`${integration.name} logo`}
              width={logoWidth}
              height={logoHeight}
              className="hidden dark:block"
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
