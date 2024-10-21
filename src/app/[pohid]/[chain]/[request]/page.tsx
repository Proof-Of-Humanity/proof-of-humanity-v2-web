import { EvidenceFile, MetaEvidenceFile, RegistrationFile } from 'types/docs';
import { ipfs, ipfsFetch } from 'utils/ipfs';
import { SupportedChainId, paramToChain, supportedChains } from 'config/chains';
import ActionBar from './ActionBar';
import Evidence from './Evidence';
import { getOffChainVouches, getRequestData } from 'data/request';
import { getContractData } from 'data/contract';
import { getArbitrationCost } from 'data/costs';
import { machinifyId, prettifyId } from 'utils/identifier';
import ExternalLink from 'components/ExternalLink';
import Identicon from 'components/Identicon';
import { explorerLink } from 'config/chains';
import Image from 'next/image';
import Previewed from 'components/Previewed';
import Label from 'components/Label';
import TimeAgo from 'components/TimeAgo';
import Link from 'next/link';
import Attachment from 'components/Attachment';
import ChainLogo from 'components/ChainLogo';
import Info from './Info';
import { Address } from 'viem';
import { Hash } from '@wagmi/core';
import { getClaimerData } from 'data/claimer';
import { ClaimerQuery, Request, Vouch as VouchQuery } from 'generated/graphql';
import Vouch from 'components/Vouch';
import { ValidVouch, isValidOnChainVouch, isValidVouch } from 'data/vouch';

interface PageProps {
  params: { pohid: string; chain: string; request: string };
}

export default async function Request({ params }: PageProps) {
  const chain = paramToChain(params.chain);

  if (!chain) throw new Error('unsupported chain');

  const pohId = machinifyId(params.pohid)!;

  const [request, contractData] = await Promise.all([
    getRequestData(chain.id, pohId, +params.request),
    getContractData(chain.id),
  ]);

  if (!request) return <span>Error occured</span>;

  const arbitrationCost = await getArbitrationCost(
    chain,
    contractData.arbitrationInfo.arbitrator,
    contractData.arbitrationInfo.extraData,
  );

  const onChainVouches = request.claimer.vouchesReceived.map((v) => v.from.id as Address);

  // This are vouches to be read directly from supabase, ie, vouches still not processed
  // (only necessary before advance state in vouching status)
  const offChainVouches: {
    voucher: Address;
    expiration: number;
    signature: Hash;
  }[] = [];

  if (request.status.id === 'vouching') {
    offChainVouches.push(...(await getOffChainVouches(chain.id, request.claimer.id, pohId)));
  }

  const hasExpired = () => {
    if (request.status.id === 'resolved') {
      if (!request.revocation && request.humanity.winnerClaim.length > 0) {
        if (request.humanity.winnerClaim[0].index === request.index) {
          if (!!contractData.humanityLifespan) {
            return (
              /* (Number(request.humanity.winnerClaim[0].resolutionTime) > 0 && 
                Number(request.humanity.winnerClaim[0].resolutionTime) + Number(contractData.humanityLifespan) < Date.now() / 1000) || 
                (Number(request.creationTime) + Number(contractData.humanityLifespan) < Date.now() / 1000) ||  */
              !request.humanity.registration ||
              Number(request.humanity.registration?.expirationTime) < Date.now() / 1000
            );
          }
        } else return true;
      }
    } else if (request.status.id === 'transferring') {
      return (
        Number(request.creationTime) + Number(contractData.humanityLifespan) < Date.now() / 1000
      );
    }
    return true;
  };

  const expired = hasExpired();

  let registrationFile: RegistrationFile | null;
  let revocationFile: EvidenceFile | null = null;

  if (request.revocation) {
    const [registrationEvidence, revocationEvidence] = await Promise.all([
      !!request.registrationEvidenceRevokedReq
        ? ipfsFetch<EvidenceFile>(request.registrationEvidenceRevokedReq)
        : request.humanity.winnerClaim.length > 0 &&
            request.humanity.winnerClaim.at(0)!.evidenceGroup.evidence.length > 0
          ? ipfsFetch<EvidenceFile>(
              request.humanity.winnerClaim.at(0)!.evidenceGroup.evidence.at(-1)!.uri,
            )
          : null,
      ipfsFetch<EvidenceFile>(request.evidenceGroup.evidence.at(-1)!.uri),
    ]);

    revocationFile = revocationEvidence;
    registrationFile =
      registrationEvidence && registrationEvidence.fileURI
        ? await ipfsFetch<RegistrationFile>(registrationEvidence.fileURI)
        : null;
  } else {
    const registrationEvidence =
      request.evidenceGroup.evidence.length > 0
        ? await ipfsFetch<EvidenceFile>(request.evidenceGroup.evidence.at(-1)!.uri)
        : null;

    registrationFile =
      registrationEvidence && registrationEvidence.fileURI
        ? await ipfsFetch<RegistrationFile>(registrationEvidence.fileURI)
        : null;
  }

  interface VouchData {
    voucher: Address | undefined;
    name: string | null | undefined;
    pohId: Address | undefined;
    photo: string | undefined;
    vouchStatus: ValidVouch | undefined;
    isOnChain: boolean;
  }

  const prepareVouchData = (
    rawVouches: Record<SupportedChainId, ClaimerQuery>[],
    isOnChain: boolean,
    skipStatusCheck: boolean,
  ): Promise<VouchData>[] => {
    return rawVouches.map(async (rawVoucher) => {
      const out: VouchData = {
        voucher: undefined,
        name: undefined,
        pohId: undefined,
        photo: undefined,
        vouchStatus: undefined,
        isOnChain: isOnChain,
      };
      try {
        const voucherEvidenceChain = supportedChains.find(
          (chain) =>
            rawVoucher[chain.id].claimer &&
            rawVoucher[chain.id].claimer?.registration?.humanity.winnerClaim,
        );
        const relevantChain = !!voucherEvidenceChain ? voucherEvidenceChain : chain;

        out.name = rawVoucher[relevantChain.id].claimer?.name;
        out.voucher = rawVoucher[relevantChain.id].claimer?.id;
        out.pohId = rawVoucher[relevantChain.id].claimer?.registration?.humanity.id;
        if (!out.pohId) out.pohId = out.voucher;
        const uri = rawVoucher[relevantChain.id].claimer?.registration?.humanity.winnerClaim
          .at(0)
          ?.evidenceGroup.evidence.at(0)?.uri;

        if (!skipStatusCheck && !isOnChain) {
          out.vouchStatus = await isValidVouch(
            chain.id,
            out.voucher!,
            offChainVouches.find(
              (vouch) => vouch.voucher === rawVoucher[relevantChain.id].claimer?.id,
            )?.expiration,
          );
        } else if (!skipStatusCheck && isOnChain) {
          out.vouchStatus = isValidOnChainVouch(
            request.claimer.vouchesReceived.find((v) => v.from.id === out.voucher!)! as VouchQuery,
          );
        }

        if (!uri) return out;

        const evFile = await Promise.resolve(ipfsFetch<EvidenceFile>(uri));
        if (!evFile?.fileURI) return out;

        out.photo = (await Promise.resolve(ipfsFetch<RegistrationFile>(evFile.fileURI))).photo;
        return out;
      } catch {
        return out;
      }
    });
  };

  const vourchesForData = prepareVouchData(
    await Promise.all([...request.claimer.vouches.map((vouch) => getClaimerData(vouch.for.id))]),
    true,
    true,
  );

  const vouchersData = prepareVouchData(
    await Promise.all([...offChainVouches.map((vouch) => getClaimerData(vouch.voucher))]),
    false,
    false,
  ).concat(
    prepareVouchData(
      await Promise.all([...onChainVouches.map((voucher) => getClaimerData(voucher))]),
      true,
      false,
    ),
  );

  const policyLink = await (async () => {
    try {
      return (
        await Promise.resolve(
          ipfsFetch<MetaEvidenceFile>(request.arbitratorHistory.registrationMeta),
        )
      ).fileURI;
    } catch (e) {
      return null;
    }
  })();

  //const policyUpdate = request.arbitratorHistory.updateTime;

  return (
    <div className="content mx-auto flex w-[84vw] max-w-[1500px] flex-col justify-center font-semibold md:w-[76vw]">
      <ActionBar
        arbitrationCost={arbitrationCost}
        index={request.index}
        status={request.status.id}
        expired={expired}
        requester={request.requester}
        contractData={contractData}
        pohId={pohId}
        lastStatusChange={+request.lastStatusChange}
        revocation={request.revocation}
        currentChallenge={
          request.challenges && request.challenges.length > 0
            ? request.challenges.at(-1)
            : undefined
        }
        funded={
          request.index >= 0 ? BigInt(request.challenges[0].rounds[0].requesterFund.amount) : 0n
        }
        onChainVouches={onChainVouches}
        offChainVouches={offChainVouches}
        arbitrationHistory={request.arbitratorHistory}
      />

      <div className="border-stroke bg-whiteBackground mb-6 rounded border shadow">
        {request.revocation && revocationFile && (
          <div className="bg-primaryBackground p-4">
            <div className="relative">
              <div className="text-primaryText flex justify-between">
                Revocation requested - {revocationFile.name}
                {revocationFile.fileURI && <Attachment uri={revocationFile.fileURI} />}
              </div>
              <p className="text-primaryText">{revocationFile.description}</p>
            </div>
            <div className="flex flex-wrap text-sm font-normal">
              <span className="text-secondaryText mr-2">Requested by</span>
              <Identicon diameter={16} address={request.requester} />
              <ExternalLink
                className="ml-1 flex flex-wrap break-words break-all text-blue-500 underline underline-offset-2"
                href={explorerLink(request.requester, chain)}
              >
                {request.requester}
              </ExternalLink>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          <div className="background border-stroke hidden w-2/5 flex-col items-stretch justify-between border-r px-8 pt-8 md:flex">
            <div className="flex flex-col items-center">
              {registrationFile && (
                <Previewed
                  uri={ipfs(registrationFile.photo)}
                  trigger={
                    <Image
                      className="h-32 w-32 cursor-pointer rounded-full bg-cover bg-center bg-no-repeat object-cover"
                      alt="image"
                      src={ipfs(registrationFile.photo)}
                      width={144}
                      height={144}
                    />
                  }
                />
              )}

              <span className="text-primaryText mb-12 mt-4 text-2xl">
                {/* {request.claimer.name} */}
                {registrationFile ? registrationFile.name : ''}
              </span>

              <span className="text-secondaryText text-sm font-light">
                {registrationFile ? registrationFile.bio : ''}
              </span>
            </div>

            <Label className="text-orange mb-8">
              Last update: <TimeAgo time={request.lastStatusChange} />
            </Label>
          </div>

          <div className="flex w-full flex-col p-[24px] lg:p-[32px]">
            <div className="mb-8 flex flex-col-reverse justify-between md:flex-row">
              <div className="flex items-center">
                <Identicon diameter={24} address={request.claimer.id} />
                <ExternalLink
                  className="text-primaryText ml-2 font-semibold underline underline-offset-2"
                  href={explorerLink(request.claimer.id, chain)}
                >
                  {request.claimer.id.slice(0, 20)}
                  <wbr />
                  {request.claimer.id.slice(20)}
                </ExternalLink>
              </div>
              <span className="text-primaryText flex items-center">
                <ChainLogo chainId={chain.id} className="fill-primaryText m-1 h-4 w-4" />
                {chain.name}
              </span>
            </div>

            <div className="text-orange mb-8 flex flex-wrap gap-x-[8px] gap-y-[8px] font-medium">
              <div className="flex flex-row flex-wrap gap-x-[8px]">
                <Image alt="poh id" src="/logo/pohid.svg" height={24} width={24} />
                <Link className="text-orange" href={`/${prettifyId(pohId)}`}>
                  {prettifyId(pohId).slice(0, 20)}
                  <wbr />
                  {prettifyId(pohId).slice(20)}
                </Link>
                <Info
                  nbRequests={+request.humanity.nbRequests + +request.humanity.nbLegacyRequests}
                />
              </div>
            </div>

            <div className="flex flex-col items-center md:hidden">
              {registrationFile && (
                <Previewed
                  uri={ipfs(registrationFile.photo)}
                  trigger={
                    <Image
                      className="h-32 w-32 cursor-pointer rounded-full object-cover"
                      alt="image"
                      src={ipfs(registrationFile.photo)}
                      width={144}
                      height={144}
                    />
                  }
                />
              )}

              <span className="text-primaryText mb-[16px] mt-4 text-2xl">
                {request.claimer.name}
              </span>

              <span className="text-secondaryText mb-[32px] text-sm font-light">
                {registrationFile ? registrationFile.bio : ''}
              </span>
            </div>

            {registrationFile && (
              <video className="w-full" src={ipfs(registrationFile.video)} controls />
            )}

            <div className="flex w-full flex-wrap justify-between gap-2 md:flex-row md:items-center">
              {policyLink && (
                <div className="flex grid w-full flex-col justify-items-end font-normal md:flex-row md:items-end">
                  <Link
                    href={`/attachment?url=${ipfs(policyLink)}`}
                    className="text-primaryText ml-2 underline"
                  >
                    <div className="text-primaryText group relative flex py-[8px]">
                      Policy in force at submission
                      <div className="\\ \\ \\ \\ \\ \\ \\ \\ outline-color: #E5E5E5 \\ bg-whiteBackground text-secondaryText invisible absolute left-1/2 z-10 m-4 mx-auto w-[260px] flex-shrink-0 -translate-x-1/2 transform place-content-center content-between rounded-[3px] border-[1px] border-[solid] bg-[var(--Light-Mode-White-background,_#FFF)] p-[8px] text-justify text-[14px] font-normal not-italic leading-[normal] outline-black transition-opacity ease-in-out [box-shadow:0px_2px_3px_0px_rgba(0,_0,_0,_0.06)] group-hover:visible md:w-[400px]">
                        <span>
                          {/* (Policy in force since {new Date(policyUpdate * 1000).toDateString()}) */}
                          This is the policy that was in effect when this submission was made. Why
                          is this important? Policies may change over time, and it's crucial to know
                          the policy that was in force at the time of a submission before
                          challenging or removing a profile. If you challenge this submission, this
                          version of the policy will be enforced by Kleros jurors if the case goes
                          to arbitration. Also, if you revoke this profile citing “incorrect
                          submission,” but the submission complied with this policy, your revocation
                          request may be rejected, and you may lose your deposit.
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              {vourchesForData.find((v) => v) && (
                <div className="text-secondaryText mt-8 flex flex-col">
                  Vouched for
                  <div className="flex flex-wrap gap-2">
                    {vourchesForData.map(async (vouch, idx) => {
                      const vouchLocal = await Promise.resolve(vouch);
                      return (
                        <Vouch
                          isActive={true}
                          reason={undefined}
                          name={vouchLocal.name}
                          photo={vouchLocal.photo}
                          idx={idx}
                          href={`/${prettifyId(vouchLocal.pohId!)}`}
                          pohId={vouchLocal.pohId}
                          address={vouchLocal.pohId}
                          isOnChain={vouchLocal.isOnChain}
                          reducedTooltip={true}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full flex-wrap justify-between gap-2 md:flex-row md:items-center">
              {vouchersData.find((v) => v) && (
                <div className="text-secondaryText mt-8 flex flex-col">
                  Vouched by
                  <div className="flex flex-wrap gap-2">
                    {vouchersData.map(async (vouch, idx) => {
                      const vouchLocal = await Promise.resolve(vouch);
                      return (
                        <Vouch
                          isActive={vouchLocal.vouchStatus?.isValid}
                          reason={vouchLocal.vouchStatus?.reason}
                          name={vouchLocal.name}
                          photo={vouchLocal.photo}
                          idx={idx}
                          href={`/${prettifyId(vouchLocal.pohId!)}`}
                          pohId={vouchLocal.pohId}
                          address={vouchLocal.voucher}
                          isOnChain={vouchLocal.isOnChain}
                          reducedTooltip={false}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <Label className="text-orange mb-8 md:hidden">
              Last update: <TimeAgo time={request.lastStatusChange} />
            </Label>
          </div>
        </div>
      </div>

      <Evidence
        list={request.evidenceGroup.evidence.sort(
          (a, b) => Number(a.creationTime) - Number(b.creationTime),
        )}
        pohId={pohId}
        requestIndex={request.index}
        arbitrationInfo={request.arbitratorHistory}
      />
    </div>
  );
}
