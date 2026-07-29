import { ObservableObject, ObservablePrimitiveBaseFns } from "@legendapp/state";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import Label from "components/Label";
import Switch from "components/Switch";
import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import Previewed from "components/Previewed";
import TimeAgo from "components/TimeAgo";
import DocumentIcon from "components/DocumentIcon";
import { getContractInfo } from "contracts";
import { SupportedChainId, idToChain, getForeignChain } from "config/chains";
import { ContractData } from "data/contract";
import InfoIcon from "icons/info.svg";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import Image from "next/image";
import { prettifyId } from "utils/identifier";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";
import { Abi, Hash, formatEther, parseEther } from "viem";
import { useAccount, useChainId, useReadContract, useSwitchChain } from "wagmi";
import useEnoughFunds from "hooks/useEnoughFunds";
import {
  EmailSubmissionStatus,
  FundingChoice,
  fundingEth,
  MediaState,
  SubmissionState,
} from "./Form";

interface ReviewProps {
  arbitrationInfo: ContractData["arbitrationInfo"];
  contractData: Record<SupportedChainId, ContractData | null>;
  totalCost: bigint | null;
  funding$: ObservablePrimitiveBaseFns<FundingChoice>;
  state$: ObservableObject<SubmissionState>;
  media$: ObservableObject<MediaState>;
  loadingMessage?: string;
  goBack: () => void;
  submit: () => void;
  registrationComplete?: boolean;
  email$: ObservablePrimitiveBaseFns<string>;
  emailStatus?: EmailSubmissionStatus;
  retryEmail?: () => void;
  skipEmail?: () => void;
  isRenewal: boolean;
}

function Review({
  arbitrationInfo,
  contractData,
  totalCost,
  funding$,
  state$,
  media$,
  loadingMessage,
  goBack,
  submit,
  registrationComplete = false,
  email$,
  emailStatus = "idle",
  retryEmail,
  skipEmail,
  isRenewal,
}: ReviewProps) {
  const funding = funding$.use();
  const submitForFree = funding.kind === "free";

  const toggleSubmitForFree = (enabled: boolean) =>
    funding$.set(enabled ? { kind: "free" } : { kind: "fullDeposit" });
  const { pohId, name } = state$.use();
  const email = email$.use();
  const { photo, video } = media$.use();
  // submit() bails out early when either is missing, so surface that as a
  // disabled reason instead of letting the button no-op silently.
  const missingMedia = [!photo && "photo", !video && "video"].filter(
    Boolean,
  ) as string[];
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();

  const selfFunded = fundingEth(funding, chainId, totalCost);

  let selfFundedWei: bigint | undefined;
  if (!submitForFree && selfFunded) {
    try {
      selfFundedWei = parseEther(selfFunded.toString());
    } catch {
      selfFundedWei = undefined;
    }
  }
  const funds = useEnoughFunds({ chainId, amount: selfFundedWei });

  const currentChain = idToChain(chainId)!;
  const { nativeCurrency } = currentChain;

  const foreignChainId = getForeignChain(chainId);
  const foreignChain = idToChain(foreignChainId)!;
  // May be null when the foreign chain's subgraph is down; the cost
  // comparison is simply skipped in that case.
  const foreignContractData = contractData[foreignChainId];
  const { data: foreignArbitrationCost } = useReadContract({
    address: foreignContractData?.arbitrationInfo.arbitrator as `0x${string}`,
    abi: getContractInfo("KlerosLiquid", foreignChainId).abi as Abi,
    functionName: "arbitrationCost",
    args: [foreignContractData?.arbitrationInfo.extraData as Hash],
    chainId: foreignChainId,
    query: { enabled: !!foreignContractData },
  });
  const foreignCost =
    foreignContractData && typeof foreignArbitrationCost === "bigint"
      ? BigInt(foreignContractData.baseDeposit) + foreignArbitrationCost
      : null;
  const totalCostLabel = totalCost ? formatEther(totalCost) : "Loading...";

  const jumperUrl = `https://jumper.exchange/?toChain=${currentChain.id}&toToken=0x0000000000000000000000000000000000000000`;

  // Assume Gnosis is always cheaper (1 xDAI = 1 USD) until we have ETH/USD price feeds
  const isCurrentChainCheaper = chainId === 100;

  const reviewChecklist = [
    "The photo must face forward, with no coverings that hide facial features.",
    "No filters, heavy makeup, or adornments that obscure the face. Hats are allowed.",
    "Your video shows the correct wallet address clearly, and you say the exact required phrase.",
  ];

  return (
    <div className="flex w-full flex-col items-center pb-2">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-primaryText text-2xl font-semibold">
          Review{" "}
          <span className="text-peach">
            {isRenewal ? "your Renewal" : "your Registration"}
          </span>
        </h1>
        <p className="text-secondaryText mt-3 text-sm leading-6">
          Make sure you read and understand the Policy
        </p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-sm">
          <ExternalLink
            className="text-orange hover:text-orange/80 flex items-center gap-1 font-medium transition-colors duration-200"
            href={ipfs(arbitrationInfo.policy)}
          >
            <DocumentIcon className="fill-orange h-4 w-4" />
            <span>Relevant Policy</span>
            <ExternalLinkIcon />
          </ExternalLink>
          <span className="text-secondaryText">
            (updated <TimeAgo time={arbitrationInfo.updateTime} />)
          </span>
        </p>
      </div>

      {/* Boxed review checklist, per Figma; keeps the deposit-loss warning. */}
      <div className="content-card mt-8 w-full px-5 py-5">
        <div className="flex flex-col items-center text-center">
          <p className="text-primaryText flex items-center gap-2 font-semibold">
            <InfoIcon className="h-5 w-5 stroke-current stroke-2 text-peach" />
            Review
          </p>
          <p className="text-secondaryText mt-1 text-sm">
            Check the uploaded files and ensure they comply with the rules —
            incorrect submissions can be challenged and your{" "}
            <span className="text-status-rejected font-medium">
              deposit may be lost.
            </span>
          </p>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5 text-left text-sm">
          {reviewChecklist.map((text) => (
            <li key={text} className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-primaryText">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 flex w-full min-w-0 flex-col items-center justify-center gap-4 overflow-hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-0">
        <div className="flex w-48 shrink-0 items-center justify-center sm:col-start-2">
          {photo ? (
            <Previewed
              kind="image"
              uri={photo.uri}
              trigger={
                <Image
                  alt="preview"
                  className="h-48 w-48 max-w-full shrink-0 rounded-full"
                  src={photo.uri}
                  width={256}
                  height={256}
                />
              }
            />
          ) : (
            <div className="bg-whiteBackground text-secondaryText flex h-48 w-48 shrink-0 items-center justify-center rounded-full text-sm">
              No photo
            </div>
          )}
        </div>
        <div className="flex w-full min-w-0 justify-center sm:col-start-4 sm:w-auto sm:min-w-0 sm:justify-center">
          {video ? (
            <video
              className="mx-auto max-h-72 w-auto max-w-full rounded bg-black object-contain sm:max-h-64"
              src={`${video.uri}#t=0.001`}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="text-secondaryText flex h-48 w-64 items-center justify-center rounded bg-black text-sm">
              No video
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col">
        <Field label="Display Name" value={name} disabled />
        <Field label="Connected Wallet" value={address} disabled />
        <Field
          label="Proof of Humanity ID"
          value={prettifyId(pohId)}
          disabled
        />
        {email ? <Field label="Email" value={email} disabled /> : null}

        <Label className="!mt-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span>{isRenewal ? "Deposit" : "Initial deposit"}</span>
            {funds.balance !== undefined && (
              <span className="text-primaryText text-sm normal-case sm:text-base">
                Your balance:{" "}
                <strong>
                  {formatEth(funds.balance)} {nativeCurrency.symbol}
                </strong>
              </span>
            )}
            <ExternalLink
              href={jumperUrl}
              className="cursor-pointer py-1 text-sm font-semibold normal-case text-purple-600 transition-all hover:text-purple-500 hover:underline sm:ml-auto"
            >
              Need {currentChain.nativeCurrency.symbol}? bridge to{" "}
              {currentChain.name} →
            </ExternalLink>
          </div>
        </Label>
        <div className="txt mb-8 flex flex-col">
          <div
            className={`flex flex-col gap-3 transition-opacity sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 ${
              submitForFree ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="w-full sm:w-48">
                <Field
                  type="number"
                  className="no-spinner text-right"
                  step="any"
                  min={0}
                  max={totalCost ? formatEther(totalCost) : undefined}
                  value={selfFunded}
                  disabled={!totalCost || submitForFree}
                  onChange={(event) =>
                    funding$.set({
                      kind: "custom",
                      eth: +event.target.value,
                      chainId,
                    })
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                <span>of</span>
                <span
                  onClick={() =>
                    !submitForFree &&
                    totalCost &&
                    funding$.set({ kind: "fullDeposit" })
                  }
                  className={`font-semibold underline underline-offset-2 ${
                    submitForFree
                      ? "cursor-not-allowed text-slate-400"
                      : "text-orange cursor-pointer"
                  }`}
                >
                  {totalCostLabel}
                </span>
                <span>{nativeCurrency.symbol}</span>
              </div>
            </div>
            {!isCurrentChainCheaper && foreignCost && (
              <>
                <span className="hidden xl:block">•</span>
                <span
                  className="inline-flex cursor-pointer items-center py-1 text-sm font-semibold text-purple-600 transition-all hover:text-purple-500 hover:underline"
                  onClick={() => switchChain?.({ chainId: foreignChainId })}
                >
                  Switch to {foreignChain.name} for a smaller deposit (
                  {formatEther(foreignCost)}{" "}
                  {foreignChain.nativeCurrency.symbol})
                </span>
              </>
            )}
          </div>

          <div className="text-primaryText mt-2 flex items-start gap-3 sm:items-center">
            <Switch
              checked={submitForFree}
              onChange={toggleSubmitForFree}
              label="Submit for free"
              className="mt-0.5 sm:mt-0"
            />
            <span
              className="min-w-0 flex-1 cursor-pointer pt-0.5 text-sm font-medium leading-snug sm:flex-none sm:pt-0 sm:text-base sm:leading-normal"
              onClick={() => toggleSubmitForFree(!submitForFree)}
            >
              Submit for free — let PoH supporters cover your deposit (you only
              pay gas)
            </span>
          </div>

          <span className="mt-1 text-blue-500">
            If you don&apos;t fund the deposit now, PoH supporters can cover it
            for you. The deposit is reimbursed after successful{" "}
            {isRenewal ? "renewal" : "registration"} and lost only if the
            profile is rejected.
          </span>
          {!isRenewal && pohId.toLowerCase() !== address?.toLowerCase() ? (
            <span className="text-orange mt-2">
              <span className="font-semibold underline">Beware</span>: Your PoH
              ID differs from the wallet address connected to your account. If
              you are registering for the first time, this discrepancy will
              result in fund loss. To make both addresses match, you may need to
              change the connected wallet, or else reinitiate the registration
              process. If you are not a newcomer and wish to reclaim your ID
              from a different wallet (e.g., if you have lost the private key to
              your original wallet), please confirm that the PoH ID you are
              using is the one from your initial registration.
            </span>
          ) : null}
        </div>
      </div>
      {registrationComplete && emailStatus === "failed" ? (
        <div className="text-primaryText mt-1 w-full text-sm">
          <p className="inline-flex items-center gap-1 font-semibold text-green-500">
            Your profile was submitted.
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </p>
          <p className="text-secondaryText mt-1">
            We couldn't save <span className="font-semibold">{email}</span> for
            profile notifications. You can retry now or enable notifications
            later from settings.
          </p>
          <div className="mt-3">
            <button
              className="btn-primary w-full py-3 text-sm font-bold"
              onClick={retryEmail}
            >
              Save email for notifications
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex w-full flex-wrap-reverse items-center justify-center gap-3">
          {!loadingMessage && (
            <ActionButton
              onClick={goBack}
              label="Back"
              variant="secondary"
              className="min-w-[170px]"
            />
          )}
          {loadingMessage ? (
            <button className="btn-primary min-w-[170px] gap-2" disabled>
              <Image
                alt="loading"
                src="/logo/poh-white.svg"
                className="animate-flip fill-white"
                width={14}
                height={14}
              />
              {loadingMessage}
            </button>
          ) : !totalCost ? (
            <button className="btn-primary min-w-[170px]" disabled>
              Loading deposit
            </button>
          ) : (
            <AuthGuard signInButtonProps={{ className: "min-w-[170px]" }}>
              <ActionButton
                onClick={submit}
                label="Submit"
                disabled={
                  funds.isLoading || funds.insufficient || !!missingMedia.length
                }
                tooltip={
                  missingMedia.length
                    ? `Your ${missingMedia.join(" and ")} ${
                        missingMedia.length > 1 ? "are" : "is"
                      } missing — use the steps above to add ${
                        missingMedia.length > 1 ? "them" : "it"
                      }.`
                    : funds.insufficient
                      ? funds.message
                      : undefined
                }
                className="min-w-[170px]"
              />
            </AuthGuard>
          )}
        </div>
      )}
    </div>
  );
}

export default Review;
