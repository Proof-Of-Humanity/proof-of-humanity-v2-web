import { ChainId } from "enums/ChainId";
import { concat, keccak256, toBeHex, toUtf8Bytes } from "ethers";
import { ReactNode, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import useContractData from "api/useContractData";
import { useRequest } from "api/useRequest";
import { useVouches } from "api/useVouches";
import AttachmentIcon from "assets/svg/AttachmentMajor.svg";
import ALink from "components/ALink";
import Identicon from "components/Identicon";
import Image from "components/Image";
import Label from "components/Label";
import PageLoader from "components/PageLoader";
import TimeAgo from "components/TimeAgo";
import Video from "components/Video";
import { CHAIN } from "constants/chains";
import { getColorForStatus } from "constants/misc";
import { Status } from "generated/graphql";
import useIPFS from "hooks/useIPFS";
import {
  useAdvanceState,
  useExecuteRequest,
  useRequestTotalCost,
  useWithdrawRequest,
} from "hooks/useProofOfHumanity";
import Appeal from "modules/appeal";
import Challenge from "modules/challenge";
import EvidenceSection from "modules/evidence/Section";
import FundButton from "modules/funding/Button";
import VouchButton from "modules/vouch/Button";
import { EvidenceFile, RegistrationFile } from "types/docs";
import { explorerLink } from "utils/address";
import { machinifyId } from "utils/identifier";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";

const genRequestId = (humanityId: string, index: number) => {
  const requestId = keccak256(
    concat([
      machinifyId(humanityId),
      index ? toBeHex(Math.abs(index)) : "0x00000000",
    ])
  );
  return index < 0
    ? keccak256(concat([requestId, toUtf8Bytes("legacy")]))
    : requestId;
};

enum Action {
  NONE,
  OLD_ACTIVE,
  VOUCH,
  FUND,
  ADVANCE,
  CHALLENGE,
  DISPUTED,
  EXECUTE,
}

const StatusDetail: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-slate-400">{children}</span>
);

const Request: React.FC = () => {
  const { humanity, index, chain } = useParams();

  const chainId = useMemo<ChainId | undefined>(
    () => chain && ChainId[chain.toUpperCase()],
    [chain]
  );

  const contractData = useContractData(chainId!);

  const requestId = useMemo(
    () => humanity && index && genRequestId(humanity, +index),
    []
  );

  const request = useRequest(chainId, requestId);
  const { totalCount, getRequestValidVouches } = useVouches(chainId, requestId);

  const [registrationEvidence] = useIPFS<EvidenceFile>(
    request &&
      (request.revocation
        ? request?.humanity.winnerClaimRequest[0]
        : request
      ).evidence.at(-1)?.URI
  );
  const [registration] = useIPFS<RegistrationFile>(
    registrationEvidence?.fileURI
  );

  const [revocationEvidence] = useIPFS<EvidenceFile>(
    request && request.revocation && request.evidence.at(-1)?.URI
  );

  const advanceState = useAdvanceState();
  const withdrawRequest = useWithdrawRequest();
  const executeRequest = useExecuteRequest();
  const totalCost = useRequestTotalCost();

  const funded = useMemo(
    () =>
      request &&
      !request.legacy &&
      request.challenges[0].rounds[0].requesterFunds,
    [request]
  );

  const challengePeriodEnd =
    contractData?.contract &&
    request &&
    Number(
      BigInt(contractData.contract.challengePeriodDuration) +
        BigInt(request.lastStatusChange)
    );

  const action = useMemo(() => {
    if (!request || !contractData || !totalCost) return Action.NONE;

    if (
      request.status === Status.Resolved ||
      request.status === Status.Withdrawn
    )
      return Action.NONE;

    if (request.legacy) return Action.OLD_ACTIVE;

    if (request.status === Status.Vouching) {
      if (!totalCost.eq(funded)) return Action.FUND;

      if (
        contractData.contract &&
        request.claimer.vouchesReceived.length >=
          +contractData.contract.requiredNumberOfVouches
      )
        return Action.ADVANCE;

      return Action.VOUCH;
    }

    if (request.status == Status.Resolving)
      return challengePeriodEnd && challengePeriodEnd * 1000 < Date.now()
        ? Action.EXECUTE
        : Action.CHALLENGE;

    if (request.status === Status.Disputed) return Action.DISPUTED;

    return Action.NONE;
  }, [contractData, request, totalCost]);

  if (
    !request ||
    !registrationEvidence ||
    !registration ||
    !humanity ||
    !index ||
    !chainId ||
    !contractData ||
    !totalCost
  )
    return <PageLoader />;

  const ChainLogo = CHAIN[chainId].Logo;

  const statusColor = getColorForStatus(request.status, request.revocation);

  const currentChallenge = request.challenges.at(-1);

  return (
    <div className="content mx-auto flex flex-col justify-center font-semibold">
      <div className="mb-6 border shadow bg-white rounded">
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex items-center">
            <span className="mr-4">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-white bg-status-${statusColor}`}
            >
              {request.status}
            </span>
          </div>
          <div className="w-full ml-8 flex items-center justify-between font-normal">
            {action >= Action.VOUCH && action < Action.ADVANCE && (
              <>
                <StatusDetail>
                  Vouches:{" "}
                  <strong>
                    {totalCount} /{" "}
                    {contractData?.contract?.requiredNumberOfVouches}
                  </strong>
                </StatusDetail>

                <VouchButton request={request} />
              </>
            )}

            {action === Action.FUND && (
              <>
                {totalCost && (
                  <StatusDetail>
                    Funded: {formatEth(funded)} / {formatEth(totalCost)} ETH
                  </StatusDetail>
                )}

                <FundButton
                  totalCost={totalCost}
                  funded={funded}
                  request={request}
                />
              </>
            )}

            {action === Action.ADVANCE && (
              <>
                <StatusDetail>Ready to advance</StatusDetail>

                <button
                  className="btn-main mb-2"
                  onClick={async () => {
                    const validVouches = await getRequestValidVouches(
                      contractData.contract!.requiredNumberOfVouches
                    );
                    await advanceState(
                      request.requester,
                      validVouches.onChain,
                      validVouches.offChain
                    );
                  }}
                >
                  Advance state
                </button>
              </>
            )}

            {action === Action.EXECUTE && (
              <>
                <StatusDetail>Ready to finalize.</StatusDetail>

                <button
                  className="btn-main mb-2"
                  onClick={async () =>
                    await executeRequest(request.humanity.id, index)
                  }
                >
                  Execute
                </button>
              </>
            )}

            {action === Action.CHALLENGE && (
              <>
                <StatusDetail>
                  Challenge period end:{" "}
                  {challengePeriodEnd && (
                    <TimeAgo time={Number(challengePeriodEnd)} />
                  )}
                </StatusDetail>

                <Challenge request={request} />
              </>
            )}

            {action === Action.DISPUTED && (
              <>
                <StatusDetail>
                  The request was challenged
                  {!request.revocation && <> for {currentChallenge?.reason}</>}.
                </StatusDetail>

                <ALink
                  href={`https://resolve.kleros.io/cases/${currentChallenge?.disputeId}`}
                  className="btn-main px-4"
                >
                  View case #{currentChallenge?.disputeId}
                </ALink>
              </>
            )}
          </div>
        </div>

        {request.revocation && revocationEvidence && (
          <div className="p-4 bg-shade-100">
            <div className="relative">
              <div className="flex justify-between">
                Revocation requested - {revocationEvidence.name}
                {revocationEvidence.fileURI && (
                  <ALink href={ipfs(revocationEvidence.fileURI)}>
                    <AttachmentIcon className="fill-black w-6" />
                  </ALink>
                )}
              </div>
              <p className="text-slate-600">
                {revocationEvidence?.description}
              </p>
            </div>
            <div className="flex font-normal text-sm">
              <span className="mr-2">Requested by</span>
              <Identicon diameter={16} address={request.requester} />
              <ALink
                className="ml-1 text-blue-500 underline underline-offset-2"
                href={explorerLink(request.requester, chainId)}
              >
                {request.requester}
              </ALink>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          <div className="relative pt-8 md:pb-48 px-8 md:w-2/5 flex flex-col background items-center border-r">
            <Image uri={ipfs(registration.photo)} rounded previewed />

            <span className="mt-4 mb-12 text-2xl">{request.claimer.name}</span>

            {action === Action.OLD_ACTIVE && (
              <ALink
                href={`https://app.proofofhumanity.id/profile/${request.humanity.id}`}
                className="text-center font-semibold text-blue-500"
              >
                This is a profile registered on the old contract. Navigate to
                the old interface to withdraw or challenge.
              </ALink>
            )}

            {request.status == Status.Vouching && (
              <button
                className="btn-main mb-2"
                onClick={async () => {
                  await withdrawRequest();
                }}
              >
                Withdraw request
              </button>
            )}

            <Label className="absolute p-8 left-0 right-0 bottom-0">
              Last update: <TimeAgo time={request.lastStatusChange} />
            </Label>
          </div>

          <div className="w-full p-8 flex flex-col">
            <div className="mb-4 flex justify-between">
              <div className="flex mb-4">
                <Identicon address={request.claimer.id} />
                <ALink
                  className="ml-2 font-semibold underline underline-offset-2"
                  href={explorerLink(request.claimer.id, chainId)}
                >
                  {request.claimer.id}
                </ALink>
              </div>
              <span className="flex">
                <ChainLogo className="w-6 h-6 mr-1" />
                {CHAIN[chainId].NAME}
              </span>
            </div>

            <div className="mb-8 flex items-center text-emerald-500">
              <span className="mr-4 font-normal">POH ID:</span>
              <Link to={`/humanity/${humanity}`}>{humanity} ➜</Link>
            </div>

            <Video className="w-full" uri={ipfs(registration.video)} />
          </div>
        </div>
      </div>

      <Appeal request={request} />

      <EvidenceSection
        humanityId={request.humanity.id}
        requestIndex={index}
        request={request}
      />
    </div>
  );
};

export default Request;
