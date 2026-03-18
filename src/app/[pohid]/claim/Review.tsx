import { ObservableObject, ObservablePrimitiveBaseFns } from "@legendapp/state";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import Label from "components/Label";
import AuthGuard from "components/AuthGuard";
import Previewed from "components/Previewed";
import TimeAgo from "components/TimeAgo";
import DocumentIcon from "components/DocumentIcon";
import { getContractInfo } from "contracts";
import { SupportedChainId, idToChain, getForeignChain } from "config/chains";
import { ContractData } from "data/contract";
import InfoIcon from "icons/info.svg";
import NewTabIcon from "icons/NewTab.svg";
import Image from "next/image";
import { prettifyId } from "utils/identifier";
import { ipfs } from "utils/ipfs";
import { formatEth } from "utils/misc";
import { Abi, Hash, formatEther } from "viem";
import { useAccount, useBalance, useChainId, useReadContract, useSwitchChain } from "wagmi";
import { MediaState, SubmissionState } from "./Form";

interface ReviewProps {
  arbitrationInfo: ContractData["arbitrationInfo"];
  contractData: Record<SupportedChainId, ContractData>;
  totalCost: bigint | null;
  selfFunded$: ObservablePrimitiveBaseFns<number>;
  submitForFree$: ObservablePrimitiveBaseFns<boolean>;
  state$: ObservableObject<SubmissionState>;
  media$: ObservableObject<MediaState>;
  loadingMessage?: string;
  submit: () => void;
}

function Review({
  arbitrationInfo,
  contractData,
  totalCost,
  selfFunded$,
  submitForFree$,
  state$,
  media$,
  loadingMessage,
  submit,
}: ReviewProps) {
  const selfFunded = selfFunded$.use();
  const submitForFree = submitForFree$.use();
  const { pohId, name } = state$.use();
  const { photo, video } = media$.use();
  const { address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();

  const { data: balance } = useBalance({ address, chainId });

  const currentChain = idToChain(chainId)!;
  const { nativeCurrency } = currentChain;

  const foreignChainId = getForeignChain(chainId);
  const foreignChain = idToChain(foreignChainId)!;
  const foreignContractData = contractData[foreignChainId];
  const foreignBaseDeposit = BigInt(foreignContractData.baseDeposit);
  const { data: foreignArbitrationCost } = useReadContract({
    address: foreignContractData.arbitrationInfo.arbitrator as `0x${string}`,
    abi: getContractInfo("KlerosLiquid", foreignChainId).abi as Abi,
    functionName: "arbitrationCost",
    args: [foreignContractData.arbitrationInfo.extraData as Hash],
    chainId: foreignChainId,
  });
  const foreignCost =
    typeof foreignArbitrationCost === "bigint"
      ? foreignBaseDeposit + foreignArbitrationCost
      : null;
  const totalCostLabel = totalCost ? formatEther(totalCost) : "Loading...";

  const jumperUrl = `https://jumper.exchange/?toChain=${currentChain.id}&toToken=0x0000000000000000000000000000000000000000`;

  // Assume Gnosis is always cheaper (1 xDAI = 1 USD) until we have ETH/USD price feeds
  const isCurrentChainCheaper = chainId === 100;

  return (
    <>
      <span className="my-4 flex w-full flex-col text-2xl font-bold text-primaryText">
        Finalize your registration
        <div className="divider mt-4 w-2/3" />
      </span>

      {/* Warning callout */}
      <div className="mb-6 flex justify-center rounded-lg border border-orange bg-lightOrange px-4 py-4 text-center transition-colors duration-200 hover:bg-[#fbe9e9]">
        <div className="flex max-w-2xl flex-col items-center">
          <InfoIcon className="h-7 w-7 stroke-current stroke-2 text-status-rejected" />
          <div className="mt-2">
            <p className="font-bold text-primaryText">Required before you continue</p>
            <p className="mt-1 text-sm text-secondaryText">
              Review this carefully — incorrect submissions can be challenged and{" "}
              <span className="font-semibold text-red-500">may lose deposit</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Policy card */}
      <div className="group mb-6 flex flex-col items-center gap-4 rounded-lg border border-stroke bg-whiteBackground px-4 py-4 text-center transition-colors duration-200 hover:bg-primaryBackground sm:flex-row sm:justify-between sm:py-3 sm:text-left">
        <div className="group/policy-icon flex items-center gap-3">
          <DocumentIcon className="h-6 w-6 fill-orange text-orange transition-transform duration-200 group-hover/policy-icon:scale-105" />
          <div>
            <p className="font-semibold text-primaryText">Registration Policy</p>
            <p className="text-xs text-secondaryText">
              Updated <TimeAgo time={arbitrationInfo.updateTime} />
            </p>
          </div>
        </div>
        <ExternalLink
          className="group/policy-link flex items-center gap-1 text-sm font-medium text-orange transition-colors duration-200 hover:text-orange/80"
          href={ipfs(arbitrationInfo.policy)}
        >
          <span>Open the full policy</span>
          <NewTabIcon className="h-4 w-4 fill-current transition-transform duration-200 group-hover/policy-link:-translate-y-0.5 group-hover/policy-link:translate-x-0.5" />
        </ExternalLink>
      </div>

      {/* Checklist */}
      <div className="mb-6 flex flex-col items-center text-center text-sm text-secondaryText">
        <p className="max-w-2xl">
          Before proceeding, make sure your submission follows the Registration Policy.
        </p>
        <p className="mt-3 font-bold text-primaryText">Check these 3 things:</p>
        <ul className="mt-3 flex w-full max-w-2xl flex-col items-start gap-3 px-2 text-left sm:px-0">
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-primaryText">
              Photo and video are <strong>clear, well-lit, forward-facing</strong>, and
              not mirrored or blurred.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-primaryText">
              Your facial features are <strong>fully visible</strong> — no coverings or
              glare
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-primaryText">
              Your video shows the <strong>correct wallet address</strong> clearly, and
              you say the <strong>exact required phrase</strong>
            </span>
          </li>
        </ul>
      </div>

      <div className="mx-auto flex w-full min-w-0 flex-col items-center justify-center gap-4 overflow-hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-0">
        <div className="flex w-48 shrink-0 items-center justify-center sm:col-start-2">
          <Previewed
            uri={photo!.uri}
            trigger={
              <Image
                alt="preview"
                className="h-48 w-48 max-w-full shrink-0 rounded-full"
                src={photo!.uri}
                width={256}
                height={256}
              />
            }
          />
        </div>
        <div className="flex w-full min-w-0 justify-center sm:col-start-4 sm:w-auto sm:min-w-0 sm:justify-center">
          <video
            className="mx-auto max-h-72 w-auto max-w-full rounded bg-black object-contain sm:max-h-64"
            src={`${video!.uri}#t=0.001`}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      <div className="flex w-full flex-col">
        <Field
          label="Proof of Humanity ID"
          value={prettifyId(pohId)}
          disabled
        />
        <Field label="Name" value={name} disabled />
        <Field label="Account" value={address} disabled />

        <Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span>Initial deposit</span>
            {balance && (
              <span className="text-primaryText normal-case">
                Your balance:{" "}
                <strong>
                  {formatEth(balance.value)} {nativeCurrency.symbol}
                </strong>
              </span>
            )}
            <ExternalLink
              href={jumperUrl}
              className="text-purple-600 cursor-pointer font-semibold text-sm normal-case hover:underline hover:text-purple-500 py-1 rounded transition-all sm:ml-auto"
            >
              Need {currentChain.nativeCurrency.symbol}? bridge to {currentChain.name} →
            </ExternalLink>
          </div>

        </Label>
        <div className="txt mb-16 flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Field
                type="number"
                className={`no-spinner text-right ${
                  submitForFree
                    ? "bg-slate-100 text-slate-400"
                    : ""
                }`}
                step="any"
                min={0}
                max={totalCost ? formatEther(totalCost) : undefined}
                value={selfFunded}
                disabled={!totalCost || submitForFree}
                onChange={(event) => selfFunded$.set(+event.target.value)}
              />
            </div>
            <span>of</span>
            <span
              onClick={() =>
                !submitForFree && totalCost && selfFunded$.set(formatEth(totalCost))
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
            {!isCurrentChainCheaper && foreignCost && (
              <>
                <span className="hidden xl:block">•</span>
                <span className="text-purple-600 cursor-pointer font-semibold text-sm hover:underline hover:text-purple-500 py-1 rounded transition-all inline-flex items-center"
                  onClick={() => switchChain?.({ chainId: foreignChainId })}>
                  Switch to {foreignChain.name} for a smaller deposit ({formatEther(foreignCost)} {foreignChain.nativeCurrency.symbol})
                </span>
              </>
            )}
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3 text-primaryText">
            <input
              type="checkbox"
              checked={submitForFree}
              onChange={(event) => {
                const enabled = event.target.checked;
                submitForFree$.set(enabled);
                selfFunded$.set(enabled ? 0 : (totalCost ? formatEth(totalCost) : 0));
              }}
              className="sr-only"
            />
            <span
              className={`relative h-7 w-12 rounded-full transition-colors ${
                submitForFree ? "bg-orange" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  submitForFree ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span className="font-medium">
              Submit for free — let PoH supporters cover my deposit
            </span>
          </label>

          <span className="mt-3 text-blue-500">
            If you don&apos;t fund the deposit now, PoH supporters can cover it
            for you. The deposit is reimbursed after successful registration and
            lost only if the profile is rejected.
          </span>
          {pohId.toLowerCase() !== address?.toLowerCase() ? (
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
      <div className="w-full">
        {loadingMessage ? (
          <button className="btn-main gap-2 md:w-full" disabled>
            <Image
              alt="loading"
              src="/logo/poh-white.svg"
              className="animate-flip fill-white"
              width={14}
              height={14}
            />
            {loadingMessage}...
          </button>
        ) : !totalCost ? (
          <button className="btn-main md:w-full" disabled>
            Loading deposit...
          </button>
        ) : (
          <AuthGuard signInButtonProps={{ className: "md:w-full" }}>
            <button className="btn-main md:w-full" onClick={submit}>
              Submit
            </button>
          </AuthGuard>
        )}
      </div>
    </>
  );
}

export default Review;
