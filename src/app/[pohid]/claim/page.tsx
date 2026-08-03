import { supportedChains } from "config/chains";
import { getContractDataAllChains } from "data/contract";
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
  const registrationContractData = registrationChain
    ? contractData[registrationChain.id]
    : null;
  const renewal =
    registrationChain &&
    registrationContractData &&
    +registrationData[registrationChain.id]!.expirationTime -
      Date.now() / 1000 <
      +registrationContractData.renewalPeriodDuration
      ? {
          ...registrationData[registrationChain.id]!,
          chain: registrationChain,
        }
      : undefined;

  if (registrationChain && registrationContractData && !renewal) {
    redirect(`/${pohid}`, RedirectType.replace);
  }

  const hasPastVerifiedClaim = supportedChains.some(
    (chain) => (humanityData[chain.id]?.humanity?.winnerClaim?.length ?? 0) > 0,
  );

  const humanityActiveOnAnyChain = supportedChains.some(
    (chain) => registrationData[chain.id],
  );

  const pendingClaimers = supportedChains.flatMap((chain) =>
    (humanityData[chain.id]?.humanity?.requests ?? [])
      .filter(
        (request) =>
          !request.revocation &&
          (request.status.id === "vouching" ||
            request.status.id === "resolving"),
      )
      .map((request) => String(request.requester)),
  );

  if (registrationChain && !registrationContractData) {
    return (
      <div className="content paper-inset flex max-w-[800px] flex-col items-center px-4 py-12 text-center sm:px-8 lg:px-10">
        <span className="text-primaryText text-lg font-semibold">
          Renewal data is temporarily unavailable.
        </span>
        <span className="text-secondaryText mt-2 max-w-xl text-sm leading-6">
          We couldn&apos;t load the contract data needed to check whether this
          active registration can be renewed. Please try again later.
        </span>
      </div>
    );
  }

  return (
    <div className="content paper-inset flex max-w-[800px] flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <FormLoader
        contractData={contractData}
        renewal={renewal}
        hasPastVerifiedClaim={hasPastVerifiedClaim}
        humanityActiveOnAnyChain={humanityActiveOnAnyChain}
        pendingClaimers={pendingClaimers}
      />
    </div>
  );
}
