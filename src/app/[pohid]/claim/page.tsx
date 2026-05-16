import { supportedChains } from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getTotalCosts } from "data/costs";
import { getHumanityData } from "data/humanity";
import { getRegistrationData } from "data/registration";
import { redirect, RedirectType } from "next/navigation";
import { machinifyId } from "utils/identifier";
import { Hash } from "viem";
import FormLoader from "./FormLoader";

interface PageProps {
  params: Promise<{ pohid: string }>;
}

export default async function Claim({ params }: PageProps) {
  const { pohid } = await params;
  if (!machinifyId(pohid)) {
    return (
      <div className="m-auto flex flex-col text-center">
        <span className="font-semibold">Invalid Proof of Humanity ID:</span>
        <span className="text-orange text-6xl font-light">{pohid}</span>
      </div>
    );
  }

  const [contractData, registrationData, humanityData] = await Promise.all([
    getContractDataAllChains(),
    getRegistrationData(pohid as Hash),
    getHumanityData(machinifyId(pohid) as Hash),
  ]);

  const registrationChain = supportedChains.find(
    (chain) => registrationData[chain.id],
  );
  const isRenewal =
    registrationChain &&
    +registrationData[registrationChain.id]!.expirationTime -
      Date.now() / 1000 <
      +contractData[registrationChain.id].renewalPeriodDuration;

  if (registrationChain && !isRenewal) {
    redirect(`/${pohid}`, RedirectType.replace);
  }

  const hasPastVerifiedClaim = supportedChains.some(
    (chain) => (humanityData[chain.id]?.humanity?.winnerClaim?.length ?? 0) > 0,
  );

  const totalCosts = await getTotalCosts(contractData);

  return (
    <div className="content paper flex flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <FormLoader
        contractData={contractData}
        fallbackTotalCosts={supportedChains.reduce(
          (acc, chain) => ({
            ...acc,
            [chain.id]: totalCosts[chain.id].toString(),
          }),
          {} as Record<(typeof supportedChains)[number]["id"], string>,
        )}
        renewal={
          registrationChain && {
            ...registrationData[registrationChain.id]!,
            chain: registrationChain,
          }
        }
        hasPastVerifiedClaim={hasPastVerifiedClaim}
      />
    </div>
  );
}
