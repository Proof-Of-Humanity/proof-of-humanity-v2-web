"use client";

import cn from "classnames";
import { ObservablePrimitiveBaseFns } from "@legendapp/state";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import InfoTooltip from "components/InfoTooltip";
import { CurrencyIcon } from "components/CurrencyField";
import { SupportedChainId, idToChain } from "config/chains";
import useEnoughFunds from "hooks/useEnoughFunds";
import CheckCircleIcon from "icons/CheckCircleOutline.svg";
import HourglassIcon from "icons/Hourglass.svg";
import InfoIcon from "icons/info.svg";
import WalletIcon from "icons/Wallet.svg";
import { clampFundingInput, resolveFunding } from "utils/funding";
import { formatEth } from "utils/misc";

enableReactUse();

type DepositPhase =
  | "loading"
  | "error"
  | "invalid"
  | "unset"
  | "partial"
  | "full";

interface RegistrationDepositProps {
  funding$: ObservablePrimitiveBaseFns<string>;
  totalCost: bigint | null;
  costError: boolean;
  isRenewal: boolean;
  locked?: boolean;
}

const resolvePhase = (
  totalCost: bigint | null,
  costError: boolean,
  value: string,
  amountWei: bigint | null,
): DepositPhase => {
  if (costError) return "error";
  if (totalCost === null) return "loading";
  if (value.trim() === "") return "unset";
  if (amountWei === null) return "invalid";
  if (amountWei >= totalCost) return "full";
  return amountWei > 0n ? "partial" : "unset";
};

const calloutCopy = (
  phase: DepositPhase,
  requestKind: string,
  requestAction: string,
) => {
  if (phase === "full")
    return {
      title: "Full deposit to be paid",
      body: "Your profile will proceed through the In Review phase once it receives the required vouches.",
    };
  if (phase === "partial")
    return {
      title: "Partial deposit",
      body: "Your profile will remain in the Vouching phase until the full deposit is paid.",
    };
  return {
    title: `Pay the deposit to ${requestAction}`,
    body: `The full deposit must be paid before your ${requestKind} can proceed to the In Review phase.`,
  };
};

const Callout = ({
  phase,
  requestKind,
  requestAction,
}: {
  phase: DepositPhase;
  requestKind: string;
  requestAction: string;
}) => {
  const done = phase === "full";
  const { title, body } = calloutCopy(phase, requestKind, requestAction);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-input border border-dashed px-6 py-2",
        done ? "border-status-registered" : "border-peach",
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        {done ? (
          <CheckCircleIcon
            aria-hidden
            className="text-status-registered h-7 w-7 fill-current"
          />
        ) : phase === "partial" ? (
          <HourglassIcon aria-hidden className="h-8 fill-current text-peach" />
        ) : (
          <WalletIcon aria-hidden className="w-8 text-peach" />
        )}
      </span>
      <div className="flex flex-col gap-2 text-xs">
        <span
          className={cn(
            "font-semibold",
            done ? "text-status-registered" : "text-primaryText",
          )}
        >
          {title}
        </span>
        <span className="text-secondaryText">{body}</span>
      </div>
    </div>
  );
};

const DepositProgress = ({
  amountWei,
  totalCost,
  symbol,
  done,
}: {
  amountWei: bigint;
  totalCost: bigint;
  symbol: string;
  done: boolean;
}) => {
  const progress = Math.min(100, Number((amountWei * 100n) / totalCost));

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Deposit covered"
        className="h-2 w-full overflow-hidden rounded-full bg-[#DDDDDD]"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200",
            done ? "bg-status-registered" : "bg-peach",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={done ? "text-status-registered" : "text-peach"}>
          {formatEther(amountWei)} of {formatEther(totalCost)} {symbol} required
        </span>
        <span className="text-secondaryText">{progress}%</span>
      </div>
    </div>
  );
};

const BalanceRow = ({
  isConnected,
  balance,
  symbol,
  amountWei,
  insufficient,
  inputInvalid,
  bridgeUrl,
  chainName,
}: {
  isConnected: boolean;
  balance?: bigint;
  symbol: string;
  amountWei: bigint | null;
  insufficient: boolean;
  /** The typed amount isn't usable, so there is nothing meaningful to judge. */
  inputInvalid: boolean;
  bridgeUrl: string;
  chainName: string;
}) => {
  const judged = !inputInvalid && !!amountWei && balance !== undefined;

  return (
    <div className="border-stroke flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs">
      <span className="flex items-center gap-2">
        <WalletIcon
          aria-hidden
          className="text-secondaryText h-4 w-4 shrink-0"
        />
        {isConnected ? (
          <>
            <span className="text-secondaryText">Wallet Balance:</span>
            <span className="text-primaryText">
              {balance === undefined ? "—" : `${formatEth(balance)} ${symbol}`}
            </span>
          </>
        ) : (
          <span className="text-secondaryText">
            Connect your wallet to see your balance
          </span>
        )}
      </span>
      {judged && !insufficient && (
        <span className="text-status-registered flex items-center gap-2">
          <CheckCircleIcon
            aria-hidden
            className="h-4 w-4 shrink-0 fill-current"
          />
          Sufficient funds
        </span>
      )}
      {judged && insufficient && (
        <span className="flex items-center gap-2">
          <span className="text-status-rejected">Insufficient funds</span>
          <ExternalLink
            href={bridgeUrl}
            className="font-semibold text-peach transition-opacity hover:underline hover:opacity-80"
          >
            Bridge to {chainName} →
          </ExternalLink>
        </span>
      )}
    </div>
  );
};

const Explainer = ({
  phase,
  requestKind,
}: {
  phase: DepositPhase;
  requestKind: string;
}) => (
  <p className="text-secondaryText flex items-start gap-2 text-xs">
    <InfoIcon
      aria-hidden
      className="mt-0.5 h-4 w-4 shrink-0 stroke-current stroke-2"
    />
    <span className="flex flex-col gap-4">
      {phase === "partial" && (
        <span>
          Your {requestKind} will remain in the Vouching stage until the full
          deposit is paid. Once it has been paid in full and you have received
          at least one vouch, your profile automatically moves to the In Review
          (Challenge) phase. In the meantime you can submit now and secure the
          rest later — you or any PoH supporter can top up the deposit at any
          time.
        </span>
      )}
      {phase === "unset" && (
        <span>
          You can pay the {requestKind} deposit in full, make a partial payment,
          or pay nothing for now and complete it later. Your {requestKind} will
          not proceed to the next phase until the full deposit has been paid —
          you or any PoH supporter can cover the rest at any time.
        </span>
      )}
      <span>
        The deposit is fully refunded after a successful {requestKind}. It is
        only forfeited if your {requestKind} is rejected after a challenge.
      </span>
    </span>
  </p>
);

function RegistrationDeposit({
  funding$,
  totalCost,
  costError,
  isRenewal,
  locked = false,
}: RegistrationDepositProps) {
  const value = funding$.use();
  const setValue = funding$.set;
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const chain = idToChain(chainId)!;
  const { symbol } = chain.nativeCurrency;
  const { wei: amountWei, overCap } = resolveFunding(value, totalCost);
  const funds = useEnoughFunds({ chainId, amount: amountWei || undefined });
  const bridgeUrl = `https://jumper.exchange/?toChain=${chain.id}&toToken=0x0000000000000000000000000000000000000000`;

  const phase = overCap
    ? "invalid"
    : resolvePhase(totalCost, costError, value, amountWei);
  const requestKind = isRenewal ? "renewal" : "registration";
  const fieldDisabled = locked || totalCost === null;
  const required = totalCost === null ? null : formatEther(totalCost);

  return (
    <section className="border-stroke mt-8 flex w-full flex-col gap-8 border-t pt-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-sm font-normal uppercase text-peach">
              {isRenewal ? "Deposit" : "Registration deposit"}
            </h2>
            <InfoTooltip label={`All amounts in ${symbol}`} align="end">
              <span>
                The deposit is paid in {chain.name}&apos;s native currency (
                {symbol}). Gas fees are charged on top.
              </span>
            </InfoTooltip>
          </div>

          <p
            className={cn(
              "bg-stroke flex min-h-[60px] items-center justify-center gap-2 rounded-input border px-4 py-2 text-center",
              costError ? "border-status-rejected" : "border-peach",
            )}
          >
            <span className="text-primaryText text-sm">Required Deposit</span>
            {costError ? (
              <span className="text-status-rejected text-2xl">unavailable</span>
            ) : totalCost === null ? (
              <span
                aria-label="Loading the required deposit"
                className="h-6 w-28 animate-pulse rounded bg-peach/20"
              />
            ) : (
              <span className="text-2xl text-peach">
                {required} {symbol}
              </span>
            )}
          </p>
        </div>

        {phase !== "loading" && phase !== "error" && (
          <Callout
            phase={phase}
            requestKind={requestKind}
            requestAction={isRenewal ? "renew" : "register"}
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <label
              htmlFor="self-funding"
              className="text-secondaryText text-sm"
            >
              Your Deposit
              {phase === "partial" && (
                <span className="text-peach"> - Partial Payment</span>
              )}
            </label>
            <button
              type="button"
              onClick={() => required && setValue(required)}
              disabled={fieldDisabled}
              className="mr-2 text-xs text-peach transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Max
            </button>
          </div>
          <Field
            id="self-funding"
            type="number"
            step="any"
            min={0}
            max={required ?? undefined}
            placeholder="Enter amount"
            value={value}
            disabled={fieldDisabled}
            status={phase === "invalid" ? "error" : undefined}
            message={
              overCap
                ? `Amount exceeds the required deposit (${required} ${symbol}).`
                : "Enter a valid amount."
            }
            onChange={(event) =>
              setValue(clampFundingInput(event.target.value))
            }
            className="no-spinner text-sm disabled:cursor-not-allowed disabled:opacity-50"
            trailing={
              <span className="mr-4 flex shrink-0 items-center">
                <CurrencyIcon symbol={symbol} />
              </span>
            }
          />
        </div>

        <BalanceRow
          isConnected={!!address}
          balance={funds.balance}
          symbol={symbol}
          amountWei={amountWei}
          insufficient={funds.insufficient}
          inputInvalid={phase === "invalid"}
          bridgeUrl={bridgeUrl}
          chainName={chain.name}
        />

        {phase !== "invalid" &&
          totalCost !== null &&
          totalCost > 0n &&
          amountWei !== null &&
          amountWei > 0n && (
            <DepositProgress
              amountWei={amountWei}
              totalCost={totalCost}
              symbol={symbol}
              done={phase === "full"}
            />
          )}
      </div>

      <Explainer phase={phase} requestKind={requestKind} />
    </section>
  );
}

export default RegistrationDeposit;
