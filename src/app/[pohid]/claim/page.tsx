import { machinifyId } from 'utils/identifier';
import { Hash } from 'viem';
import { supportedChains } from 'config/chains';
import { redirect } from 'next/navigation';
import { RedirectType } from 'next/dist/client/components/redirect';
import dynamic from 'next/dynamic';
import { getContractDataAllChains } from 'data/contract';
import { getRegistrationData } from 'data/registration';
import { getTotalCosts } from 'data/costs';
import Loading from '../loading';

const Form = dynamic(() => import('./Form'), {
  ssr: false,
  loading: () => <Loading />,
});

interface PageProps {
  params: { pohid: string };
}

export default async function Claim({ params: { pohid } }: PageProps) {
  if (!machinifyId(pohid))
    return (
      <div className="m-auto flex flex-col text-center">
        <span className="font-semibold">Invalid Proof of Humanity ID:</span>
        <span className="text-orange text-6xl font-light">{pohid}</span>
      </div>
    );

  const [contractData, registrationData] = await Promise.all([
    getContractDataAllChains(),
    getRegistrationData(pohid as Hash),
  ]);

  const registrationChain = supportedChains.find((chain) => registrationData[chain.id]);
  const isRenewal =
    registrationChain &&
    +registrationData[registrationChain.id]!.expirationTime - Date.now() / 1000 <
      +contractData[registrationChain.id].renewalPeriodDuration;

  if (registrationChain && !isRenewal) redirect(`/${pohid}`, RedirectType.replace);

  const totalCosts = await getTotalCosts(contractData);

  return (
    <div className="content paper flex flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-6">
      <Form
        contractData={contractData}
        totalCosts={totalCosts}
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
