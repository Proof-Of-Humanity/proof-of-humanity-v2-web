import { supportedChains } from "config/chains";
import { getContractDataAllChains } from "data/contract";
import { getRegistrationData } from "data/registration";
import { RedirectType } from "next/dist/client/components/redirect";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { machinifyId } from "utils/identifier";
import { Hash } from "viem";
import Loading from "../loading";

const Form = dynamic(() => import("./Form"), {
  ssr: false,
  loading: () => <Loading />,
});

interface PageProps {
  params: { pohid: string };
}

export default async function Claim({ params: { pohid } }: PageProps) {
  console.log("[claim/page] Request started", { pohid });

  if (!machinifyId(pohid)) {
    console.warn("[claim/page] Invalid PoH ID", { pohid });
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
  ]).catch((error) => {
    console.error("[claim/page] Failed to load server data", {
      pohid,
      error,
    });
    throw error;
  });

  const registrationChain = supportedChains.find(
    (chain) => registrationData[chain.id],
  );
  const isRenewal =
    registrationChain &&
    +registrationData[registrationChain.id]!.expirationTime -
      Date.now() / 1000 <
      +contractData[registrationChain.id].renewalPeriodDuration;

  console.log("[claim/page] Registration state resolved", {
    pohid,
    registrationChainId: registrationChain?.id ?? null,
    activeRegistrationChainIds: supportedChains
      .filter((chain) => Boolean(registrationData[chain.id]))
      .map((chain) => chain.id),
    isRenewal: Boolean(isRenewal),
  });

  if (registrationChain && !isRenewal) {
    console.log("[claim/page] Redirecting to profile", {
      pohid,
      registrationChainId: registrationChain.id,
    });
    redirect(`/${pohid}`, RedirectType.replace);
  }

  console.log("[claim/page] Rendering claim form", {
    pohid,
    renewalChainId: registrationChain?.id ?? null,
  });

  return (
    <div className="content paper flex flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <Form
        contractData={contractData}
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
