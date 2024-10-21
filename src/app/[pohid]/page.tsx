import cn from 'classnames';
import { HumanityQuery } from 'generated/graphql';
import { shortenAddress } from 'utils/address';
import { explorerLink, getForeignChain, idToChain } from 'config/chains';
import { machinifyId, prettifyId } from 'utils/identifier';
import { SupportedChainId, supportedChains } from 'config/chains';
import Link from 'next/link';
import { getHumanityData } from 'data/humanity';
import { getContractDataAllChains } from 'data/contract';
import ExternalLink from 'components/ExternalLink';
import Card from 'components/Request/Card';
import Image from 'next/image';
import Revoke from './Revoke';
import { getArbitrationCost } from 'data/costs';
import TimeAgo from 'components/TimeAgo';
import Renew from './Renew';
import CrossChain from './CrossChain';

type PoHRequest = ArrayElement<NonNullable<HumanityQuery['humanity']>['requests']> & {
  chainId: SupportedChainId;
  expired: boolean;
};

type WinnerClaimRequest = NonNullable<HumanityQuery['humanity']>['winnerClaim'][0];

type WinnerClaimData = {
  chainId: SupportedChainId | boolean;
  status: string;
  request: WinnerClaimRequest | undefined;
  exists: boolean;
  expired: boolean | null | undefined;
};

interface PageProps {
  params: { pohid: string };
}

async function Profile({ params: { pohid } }: PageProps) {
  const pohId = machinifyId(pohid);

  if (!pohId) return <>Not found</>;

  const [humanity, contractData] = await Promise.all([
    getHumanityData(pohId),
    getContractDataAllChains(),
  ]);

  const homeChain = supportedChains.find(
    (chain) =>
      !!humanity[chain.id]?.humanity?.registration &&
      !(humanity[chain.id]?.humanity?.registration?.expirationTime < Date.now() / 1000),
  );

  const arbitrationCost = homeChain
    ? await getArbitrationCost(
        homeChain,
        contractData[homeChain.id].arbitrationInfo.arbitrator,
        contractData[homeChain.id].arbitrationInfo.extraData,
      )
    : 0n;

  const lastEvidenceChain = homeChain
    ? supportedChains.sort((chain1, chain2) => {
        const req1 = humanity[chain1.id]?.humanity?.winnerClaim[0];
        const req2 = humanity[chain2.id]?.humanity?.winnerClaim[0];
        return req2 ? (req1 ? Number(req2.resolutionTime) - Number(req1.resolutionTime) : 1) : -1;
      })[0]
    : null;

  const retrieveWinnerClaimData = (): WinnerClaimData => {
    let chainId: SupportedChainId | boolean = false;
    let status;
    let request: WinnerClaimRequest | undefined = undefined;
    let exists: boolean = false;
    let expired: boolean | null | undefined = true;
    let requestQuery;

    if (homeChain && lastEvidenceChain) {
      request = humanity[lastEvidenceChain.id].humanity!.winnerClaim[0];
      if (request) {
        requestQuery = humanity[lastEvidenceChain.id]!.humanity!.requests.find(
          (req) => req.index === request!.index,
        );
        expired =
          humanity[homeChain.id]!.humanity!.registration!.expirationTime < Date.now() / 1000;
        /* expired = (
          (Number(request.resolutionTime) > 0 && 
          Number(request.resolutionTime) + Number(contractData[lastEvidenceChain.id].humanityLifespan) < Date.now() / 1000) || 
          (Number(requestQuery?.creationTime) + Number(contractData[lastEvidenceChain.id].humanityLifespan) < Date.now() / 1000)
        ); */
        if (expired) {
          request = undefined;
        } else {
          exists = true;
          chainId = lastEvidenceChain.id;
          status = requestQuery?.status.id as string;
        }
      }
    }

    return { chainId, status, request, exists, expired } as WinnerClaimData;
  };

  let winnerClaimData: WinnerClaimData = retrieveWinnerClaimData();

  const pendingRequests = supportedChains.reduce(
    (acc, chain) => [
      ...acc,
      ...(humanity[chain.id].humanity
        ? humanity[chain.id]!.humanity!.requests.filter((req) => {
            return (
              req.status.id !== 'withdrawn' &&
              req.status.id !== 'resolved' &&
              req.status.id !== 'transferred' &&
              req.status.id !== 'transferring' &&
              !(
                req.index === winnerClaimData.request?.index && chain.id === winnerClaimData.chainId
              )
            ); // No winner claim
          }).map((req) => ({
            ...req,
            chainId: chain.id,
            expired: false,
          }))
        : []),
    ],
    [] as PoHRequest[],
  );

  const sortRequests = (requests: PoHRequest[]): PoHRequest[] => {
    requests.sort((req1, req2) => req2.lastStatusChange - req1.lastStatusChange);
    return requests;
  };

  // pastRequests must not contain pendingRequests nor winningClaimRequest if it did not expired
  const pastRequests = sortRequests(
    supportedChains.reduce(
      (acc, chain) => [
        ...acc,
        ...(humanity[chain.id].humanity
          ? humanity[chain.id]!.humanity!.requests.filter(
              (req) =>
                !pendingRequests.some(
                  (pending) => req.id === pending.id && pending.chainId === chain.id,
                ) && // No pending requests
                (!(
                  winnerClaimData.request &&
                  req.index === winnerClaimData.request.index &&
                  chain.id === winnerClaimData.chainId
                ) || // No winnerClaimRequest if it did not expired
                  !winnerClaimData.request), // if winnerClaimRequest has expired it is left as pastRequest
            ).map((req) => ({
              ...req,
              chainId: chain.id,
              expired: true,
            }))
          : []),
      ],
      [] as PoHRequest[],
    ),
  );

  const lastTransferChain = supportedChains.sort((chain1, chain2) => {
    const out1 = humanity[chain1.id]?.outTransfer;
    const out2 = humanity[chain2.id]?.outTransfer;
    return out2 ? (out1 ? out2.transferTimestamp - out1.transferTimestamp : 1) : -1;
  })[0];

  const canRenew =
    homeChain &&
    +humanity[homeChain.id]!.humanity!.registration!.expirationTime - Date.now() / 1000 <
      +contractData[homeChain.id].renewalPeriodDuration;

  return (
    <div className="content">
      <div className="paper relative mt-24 flex flex-col items-center pt-20">
        <div className="bordered absolute -top-16 left-1/2 -translate-x-1/2 rounded-full shadow">
          <div className="bg-whiteBackground h-32 w-32 rounded-full px-6 pt-5">
            <Image alt="poh id" src="/logo/pohid.svg" height={128} width={128} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">POH ID</span>
          <span className="mb-12 text-center text-xl font-semibold">
            {prettifyId(pohId).slice(0, 20)}
            <wbr />
            {prettifyId(pohId).slice(20)}
          </span>
        </div>

        {
          /* lastEvidenceChain &&  */ homeChain && !winnerClaimData.expired ? (
            <>
              <div className="mb-2 flex text-emerald-500">
                Claimed by
                <ExternalLink
                  className="ml-2 underline underline-offset-2"
                  href={explorerLink(
                    humanity[homeChain.id]!.humanity!.registration!.claimer.id,
                    homeChain,
                  )}
                >
                  {shortenAddress(humanity[homeChain.id]!.humanity!.registration!.claimer.id)}
                </ExternalLink>
              </div>

              <span className="text-secondaryText mb-2">
                {humanity[homeChain.id]!.humanity!.registration!.expirationTime < Date.now() / 1000
                  ? 'Expired '
                  : 'Expires '}
                <TimeAgo time={humanity[homeChain.id]!.humanity!.registration!.expirationTime} />
              </span>

              {canRenew ? (
                <Renew
                  claimer={humanity[homeChain.id]!.humanity!.registration!.claimer.id}
                  pohId={pohId}
                />
              ) : (
                <span className="text-secondaryText">
                  Renewal available{' '}
                  <TimeAgo
                    time={
                      +humanity[homeChain.id]!.humanity!.registration!.expirationTime -
                      +contractData[homeChain.id].renewalPeriodDuration
                    }
                  />
                </span>
              )}

              <Revoke
                pohId={pohId}
                arbitrationInfo={contractData[homeChain.id].arbitrationInfo!}
                homeChain={homeChain}
                cost={arbitrationCost + BigInt(contractData[homeChain.id].baseDeposit)}
              />
              <CrossChain
                claimer={humanity[homeChain.id]!.humanity!.registration!.claimer.id}
                contractData={contractData}
                homeChain={homeChain}
                pohId={pohId}
                humanity={humanity}
                lastTransfer={humanity[lastTransferChain.id].outTransfer}
                lastTransferChain={lastTransferChain}
                winningStatus={winnerClaimData.status}
              />
            </>
          ) : pastRequests.length > 0 && pastRequests[0].status.id === 'transferred' ? (
            <CrossChain
              claimer={humanity[lastTransferChain.id]?.humanity!.registration?.claimer.id}
              contractData={contractData}
              homeChain={idToChain(getForeignChain(lastTransferChain.id))!}
              pohId={pohId}
              humanity={humanity}
              lastTransfer={humanity[lastTransferChain.id].outTransfer}
              lastTransferChain={lastTransferChain}
              winningStatus={'transferred'}
            />
          ) : (
            <>
              <span className="text-orange mb-6">Not claimed</span>
              <Link className="btn-main mb-6 w-48" href={`/${pohId}/claim`}>
                Claim humanity
              </Link>
            </>
          )
        }
      </div>

      <div className={'flex flex-col sm:flex-row sm:gap-4'}>
        {winnerClaimData.exists && (
          <div>
            <div className="text-primaryText mb-1 mt-4 p-4">
              {winnerClaimData.status !== 'transferring'
                ? 'Winning claim'
                : 'Crossing chain (update)'}
            </div>
            <div
              className={cn('grid', {
                'grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4':
                  !pendingRequests.length,
              })}
            >
              {homeChain ? (
                <Card
                  chainId={winnerClaimData.chainId as SupportedChainId}
                  claimer={humanity[homeChain.id]!.humanity!.registration!.claimer.id}
                  evidence={winnerClaimData.request!.evidenceGroup.evidence}
                  humanity={{
                    id: pohId,
                    winnerClaim:
                      humanity[winnerClaimData.chainId as SupportedChainId]!.humanity!.winnerClaim,
                  }}
                  index={winnerClaimData.request!.index}
                  requester={humanity[homeChain.id]!.humanity!.registration!.claimer.id}
                  revocation={false}
                  registrationEvidenceRevokedReq={''}
                  status={winnerClaimData.status as string}
                  expired={false}
                />
              ) : null}
            </div>
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div>
            <div className="text-primaryText mb-1 mt-4 p-4">
              {pendingRequests.length} pending request
              {pendingRequests.length !== 1 && 's'}
            </div>
            <div
              className={cn(
                'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
                homeChain && winnerClaimData.request!
                  ? 'md:grid-cols-2 xl:grid-cols-3'
                  : 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
              )}
            >
              {pendingRequests.map((req) => (
                <Card
                  key={req.id}
                  chainId={req.chainId}
                  claimer={req.claimer.id}
                  evidence={req.evidenceGroup.evidence}
                  humanity={{
                    id: pohId,
                    winnerClaim: humanity![req.chainId]!.humanity!.winnerClaim,
                  }}
                  index={req.index}
                  requester={req.requester}
                  revocation={req.revocation}
                  registrationEvidenceRevokedReq={req.registrationEvidenceRevokedReq}
                  status={req.status.id}
                  expired={req.expired}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {pastRequests.length > 0 && (
        <>
          <div className="text-primaryText mb-1 mt-8 p-4">
            {pastRequests.length} past request
            {pastRequests.length !== 1 && 's'}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pastRequests.map((req) => (
              <Card
                key={req.chainId + '/' + req.id}
                chainId={req.chainId}
                claimer={req.claimer.id}
                evidence={req.evidenceGroup.evidence}
                humanity={{
                  id: pohId,
                  winnerClaim: humanity![req.chainId]!.humanity!.winnerClaim,
                }}
                index={req.index}
                requester={req.requester}
                revocation={req.revocation}
                registrationEvidenceRevokedReq={req.registrationEvidenceRevokedReq}
                status={req.status.id}
                expired={req.expired}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
