import { Metadata } from "next";
import IntegrationsList from "components/Integrations/IntegrationsList";
import { getIntegrations } from "data/integrations";
import ConnectIcon from "components/ConnectIcon";

export const metadata: Metadata = {
  title: "Proof of Humanity V2 - App Integrations",
};

export default async function AppPage() {
  const integrations = await getIntegrations();
  
  return (
    <div className="content-wide mt-6 flex flex-col">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-primaryText">
          <span className="text-primary text-orange"><ConnectIcon /></span> Rewards
        </h1>
        <p className="mt-2 text-base text-gray-700 text-secondaryText">
          Unlock exclusive airdrops & rewards with your Proof of Humanity profile. Ready to get rewarded for being part of the Proof of Humanity (PoH) community? Start claiming rewards now and make the most of your PoH identity!
        </p>
      </div>
      
      <div className="mt-4">
        <h2 className="mb-4 text-xl text-primaryText">Available integrations:</h2>
        <IntegrationsList integrations={integrations} />
      </div>
    </div>
  );
} 