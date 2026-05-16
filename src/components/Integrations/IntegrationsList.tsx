"use client";

import { Integration } from "types/integrations";
import IntegrationCard from "./IntegrationCard";

interface IntegrationsListProps {
  integrations: Integration[];
}

export default function IntegrationsList({
  integrations,
}: IntegrationsListProps) {
  if (integrations.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-secondaryText text-gray-500">
          No integrations available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  );
}
