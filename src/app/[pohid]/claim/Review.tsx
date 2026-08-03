import { useState } from "react";
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
import { SupportedChainId, idToChain, getForeignChain } from "config/chains";
import { ContractData } from "data/contract";
import InfoIcon from "icons/info.svg";
import { CurrencyIcon } from "components/CurrencyField";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import Image from "next/image";
import { prettifyId } from "utils/identifier";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";
import { resolveTxState } from "utils/txState";
import { Hash, formatEther } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import useEnoughFunds from "hooks/useEnoughFunds";
import { EmailSubmissionStatus, MediaState, SubmissionState } from "./Form";
import { useTotalCost } from "./useTotalCost";
import {
  Funding,
  clampFundingInput,
  fundingDisplay,
  computeFundingWei,
} from "utils/funding";

interface ReviewProps {
  arbitrationInfo: ContractData["arbitrationInfo"];
  contractData: Record<SupportedChainId, ContractData | null>;
  pohId: Hash;
  funding$: ObservablePrimitiveBaseFns<Funding>;
  state$: ObservableObject<SubmissionState>;
  media$: ObservableObject<MediaState>;
  loadingMessage?: string;
  goBack: () => void;
  submit: () => void;
  registrationComplete?: boolean;
  email$: ObservablePrimitiveBaseFns<string>;
  emailStatus?: EmailSubmissionStatus;
  retryEmail: () => void;
  skipEmail: () => void;
  isRenewal: boolean;
}

const reviewChecklist = [
  "The photo must face forward, with no coverings that hide facial features.",
  "No filters, heavy makeup, or adornments that obscure the face. Hats are allowed.",
  "Your video shows the correct wallet address clearly, and you say the exact required phrase.",
];

function Review({
  arbitrationInfo,
  contractData,
  pohId,
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
  const submitForFree = funding === "free";

  const toggleSubmitForFree = (enabled: boolean) =>
    funding$.set(enabled ? "free" : "full");
  const { name } = state$.use();
  const email = email$.use();
  const { photo, video } = media$.use();
  // Surface missing prerequisites as a disabled reason instead of a silent no-op.
  const missingMedia = [!photo && "photo", !video && "video"].filter(
    Boolean,
  ) as string[];
  const [checkedRules, setCheckedRules] = useState<boolean[]>(() =>
    reviewChecklist.map(() => false),
  );
  const toggleRule = (index: number) =>
    setCheckedRules((prev) => prev.map((v, i) => (i === index ? !v : v)));
  const allRulesChecked = checkedRules.every(Boolean);
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();

  const {
    data: totalCost = null,
    isError: totalCostError,
    refetch: refetchTotalCost,
  } = useTotalCost(chainId, contractData);

  const selfFunded = fundingDisplay(funding, totalCost);
  const selfFundedWei = computeFundingWei(funding, totalCost);
  const funds = useEnoughFunds({
    chainId,
    // `null` (invalid) and `0n` (free/zero) both mean nothing to pay.
    amount: selfFundedWei || undefined,
  });
  const submitState = resolveTxState([
    {
      active: !!missingMedia.length,
      message: missingMedia.length
        ? `Your ${missingMedia.join(" and ")} ${
            missingMedia.length > 1 ? "are" : "is"
          } missing — use the steps above to add ${
            missingMedia.length > 1 ? "them" : "it"
          }.`
        : undefined,
    },
    { active: funds.isLoading },
    { active: funds.insufficient, message: funds.message },
    {
      active: !!totalCost && selfFundedWei === null,
      message: "Enter a valid deposit amount.",
    },
    {
      active: !allRulesChecked,
      message: "Confirm every item in the review checklist first.",
    },
  ]);

  const currentChain = idToChain(chainId)!;
  const { nativeCurrency } = currentChain;

  const foreignChainId = getForeignChain(chainId);
  const foreignChain = idToChain(foreignChainId)!;
  // Null when the foreign chain’s subgraph is down; the comparison is skipped then.
  const foreignContractData = contractData[foreignChainId];
  const { data: foreignCost = null } = useTotalCost(
    foreignChainId,
    contractData,
    !!foreignContractData,
  );
  const totalCostLabel = totalCost
    ? formatEther(totalCost)
    : totalCostError
      ? "unavailable"
      : "Loading...";
  const depositMet =
    !!totalCost && selfFundedWei !== null && selfFundedWei >= totalCost;
  const jumperUrl = `https://jumper.exchange/?toChain=${currentChain.id}&toToken=0x0000000000000000000000000000000000000000`;

  // Assume Gnosis is always cheaper (1 xDAI = 1 USD) until we have ETH/USD price feeds
  const isCurrentChainCheaper = chainId === 100;

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
          {reviewChecklist.map((text, index) => (
            <li key={text}>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="checkbox h-4 w-4 shrink-0 cursor-pointer"
                  checked={checkedRules[index]}
                  onChange={() => toggleRule(index)}
                />
                <span
                  className={`transition-colors duration-200 ${
                    checkedRules[index]
                      ? "text-primaryText"
                      : "text-secondaryText"
                  }`}
                >
                  {text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex w-full flex-col">
        <Field label="Display Name" value={name} disabled />
        <Field label="Connected Wallet" value={address} disabled />
        <Field
          label="Proof of Humanity ID"
          value={prettifyId(pohId)}
          disabled
        />
        {email ? <Field label="Email" value={email} disabled /> : null}

        <Label className="!mt-2">
          <div className="flex w-full items-center justify-between gap-2">
            <span>{isRenewal ? "Deposit" : "Initial deposit"}</span>
            {funds.balance !== undefined && (
              <span className="text-secondaryText text-sm font-normal normal-case">
                Balance: {formatEth(funds.balance)} {nativeCurrency.symbol}
              </span>
            )}
          </div>
        </Label>
        <div className="txt mb-8 flex flex-col">
          <div
            className={`transition-opacity ${submitForFree ? "opacity-50" : ""}`}
          >
            <Field
              type="number"
              className="no-spinner"
              step="any"
              min={0}
              max={totalCost ? formatEther(totalCost) : undefined}
              value={selfFunded}
              disabled={!totalCost || submitForFree}
              onChange={(event) => {
                const raw = clampFundingInput(event.target.value);
                const wei = computeFundingWei(raw, null);
                funding$.set(
                  wei !== null && totalCost !== null && wei >= totalCost
                    ? "full"
                    : raw,
                );
              }}
              trailing={
                <div className="mr-4 flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={!totalCost || submitForFree}
                    onClick={() => funding$.set("full")}
                    className="text-orange text-xs font-semibold tracking-wide transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    MAX
                  </button>
                  <CurrencyIcon symbol={nativeCurrency.symbol} />
                </div>
              }
            />
          </div>
          <span
            className={`mt-1.5 text-center text-xs ${
              depositMet ? "text-secondaryText" : "text-orange"
            }`}
          >
            {submitForFree
              ? `0 of ${totalCostLabel} ${nativeCurrency.symbol} — covered by PoH supporters`
              : `${selfFunded || "0"} of ${totalCostLabel} ${nativeCurrency.symbol} required`}
          </span>
          {funds.insufficient && (
            <ExternalLink
              href={jumperUrl}
              className="text-orange mt-1 cursor-pointer self-center text-xs font-semibold transition-all hover:underline hover:opacity-80"
            >
              Need {nativeCurrency.symbol}? Bridge to {currentChain.name} →
            </ExternalLink>
          )}

          <div className="text-primaryText mt-3 flex items-start gap-3 sm:items-center">
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

          <span className="text-secondaryText mt-2 flex items-start gap-2 text-sm">
            <InfoIcon
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 stroke-current stroke-2"
            />
            <span>
              The deposit is reimbursed after successful{" "}
              {isRenewal ? "renewal" : "registration"} and lost only if the
              profile is rejected. Any amount not contributed now can be covered
              by PoH supporters later.
            </span>
          </span>
          {!isCurrentChainCheaper && foreignCost && (
            <button
              type="button"
              className="text-orange hover:text-orange/80 mt-1.5 cursor-pointer self-start text-left text-sm transition-colors"
              onClick={() => switchChain?.({ chainId: foreignChainId })}
            >
              Switch to {foreignChain.name} for a smaller deposit (
              {formatEther(foreignCost)} {foreignChain.nativeCurrency.symbol})
            </button>
          )}
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
            We couldn&apos;t save <span className="font-semibold">{email}</span>{" "}
            for profile notifications. You can retry now or enable notifications
            later from settings.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              className="btn-primary w-full py-3 text-sm font-bold"
              onClick={retryEmail}
            >
              Save email for notifications
            </button>
            <ActionButton
              onClick={skipEmail}
              label="Skip for now"
              variant="secondary"
              className="w-full"
            />
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
          ) : totalCostError ? (
            <ActionButton
              onClick={() => void refetchTotalCost()}
              label="Deposit unavailable — Retry"
              variant="secondary"
              className="min-w-[170px]"
            />
          ) : totalCost === null ? (
            <button className="btn-primary min-w-[170px]" disabled>
              Loading deposit
            </button>
          ) : (
            <AuthGuard signInButtonProps={{ className: "min-w-[170px]" }}>
              <ActionButton
                onClick={submit}
                label="Submit"
                disabled={submitState.disabled}
                tooltip={submitState.tooltip}
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
