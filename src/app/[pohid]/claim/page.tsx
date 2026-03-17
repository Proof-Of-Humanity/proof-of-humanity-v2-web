import { supportedChains } from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getTotalCosts } from "data/costs";
import { getRegistrationData } from "data/registration";
import { RedirectType, redirect } from "next/navigation";
import { machinifyId } from "utils/identifier";
import { Hash } from "viem";
import Form from "./Form";

interface PageProps {
  params: Promise<{ pohid: string }>;
}

export default async function Claim(props: PageProps) {
  const params = await props.params;

  const { pohid } = params;

  if (!machinifyId(pohid)) {
    return (
      <div className="m-auto flex flex-col text-center">
        <span className="font-semibold">Invalid Proof of Humanity ID:</span>
        <span className="text-orange text-6xl font-light">{pohid}</span>
      </div>
    );
  }

  const [contractData, registrationData] = await Promise.all([
    getContractDataAllChains(),
    getRegistrationData(pohid as Hash),
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

  const totalCosts = await getTotalCosts(contractData);

  return (
    <div className="content paper flex flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <Form
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
      />
    </div>
  );
}
