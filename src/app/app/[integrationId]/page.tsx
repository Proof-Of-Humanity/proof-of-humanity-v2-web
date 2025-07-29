import { Metadata } from "next";
import { getIntegration } from "data/integrations";
import CirclesIntegration from "./CirclesIntegration";
import { Integration } from "types/integrations";
import { redirect } from "next/navigation";

interface IntegrationPageProps {
  params: {
    integrationId: string;
  };
}

export async function generateMetadata({
  params,
}: IntegrationPageProps): Promise<Metadata> {
  const integration = await getIntegration(params.integrationId);
  
  if (!integration) {
    return {
      title: "Integration Not Found - Proof of Humanity V2",
    };
  }
  
  return {
    title: `${integration.name} - Proof of Humanity V2`,
  };
}

export default async function IntegrationPage({
  params,
}: IntegrationPageProps) {
  const integration = await getIntegration(params.integrationId);
  
  if (!integration || !integration.isActive) {
    redirect("/app/");
  }
  
  // Create a mapping of integration IDs to their respective components
  const IntegrationComponents: Record<string, React.ComponentType<{integration: Integration}>> = {
    circles: CirclesIntegration,
  };

  const IntegrationComponent = IntegrationComponents[integration.id];
  
  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-12">
      {IntegrationComponent ? (
        <IntegrationComponent integration={integration} />  
      ) : (
        <div role="alert" className="text-center">
          <h2 className="text-xl">Integration Not Implemented</h2>
          <p>The integration "{integration.name}" exists but has not been implemented yet.</p>
        </div>
      )}
    </div>
  );
} 