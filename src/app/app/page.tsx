import { Metadata } from "next";
import IntegrationsList from "components/Integrations/IntegrationsList";
import ReferralDashboard from "components/Integrations/Referral/ReferralDashboard";
import { getIntegrations } from "data/integrations";
import GiftIcon from "icons/Gift.svg";

export const metadata: Metadata = {
  title: "Proof of Humanity V2 - App Integrations",
};

export default async function AppPage() {
  const integrations = await getIntegrations();

  return (
    <div className="content-wide flex flex-col">
      <div className="mb-6">
        <h1 className="text-primaryText flex items-center gap-2 text-2xl font-semibold">
          <span className="text-orange">
            <GiftIcon className="h-7 w-7" />
          </span>{" "}
          Rewards
        </h1>
        <p className="text-secondaryText mt-2 max-w-3xl text-sm">
          Unlock rewards and perks available to verified humans on Proof of
          Humanity. Claim airdrops, access partner benefits, and make the most
          of your PoH identity.
        </p>
      </div>

      <div className="mt-4">
        <IntegrationsList integrations={integrations} />
      </div>

      <div className="mt-8">
        <ReferralDashboard />
      </div>
    </div>
  );
}
