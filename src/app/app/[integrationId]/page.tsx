import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getIntegration } from "data/integrations";
import CirclesIntegration from "./CirclesIntegration";

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
  
  if (!integration) {
    redirect("/app/");
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {integration.id === 'circles' && <CirclesIntegration integration={integration} />}
    </div>
  );
} 