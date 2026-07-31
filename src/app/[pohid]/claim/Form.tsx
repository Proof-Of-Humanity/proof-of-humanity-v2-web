"use client";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { Show, Switch, useObservable } from "@legendapp/state/react";
import cn from "classnames";
import { SupportedChain, SupportedChainId, idToChain } from "config/chains";
import { getContractInfo } from "contracts";
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { getArbitrationCost } from "data/costs";
import { RegistrationQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import { useParams, useRouter } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { machinifyId } from "utils/identifier";
import { Abi, Hash } from "viem";
import { useAccount, useChainId, useConfig, useReadContract } from "wagmi";
import { getChainId } from "wagmi/actions";
import ActionButton from "components/ActionButton";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";
import { isValidEmailAddress } from "utils/validators";
import Connect from "./Connect";
import Finalized from "./Finalized";
import { Funding, computeFundingWei } from "utils/funding";
import InfoStep, { InfoState } from "./Info";
import PhotoStep from "./Photo";
import ReviewStep from "./Review";
import VideoStep from "./Video";
import { getWriteErrorMessage } from "hooks/useActionFeedback";

enableReactUse();

const steps = ["Start", "Photo", "Video", "Review"];

const Stepper: React.FC<{
  step: number;
  onStepClick?: (i: number) => void;
}> = ({ step, onStepClick }) => (
  <div className="mb-6 flex w-full cursor-default select-none items-center justify-center gap-2">
    {steps.map((item, i) => (
      <Fragment key={item}>
        <button
          type="button"
          disabled={!onStepClick || step <= i}
          aria-current={step === i ? "step" : undefined}
          className={cn(
            "centered h-8 whitespace-nowrap rounded-full text-sm",
            step === i
              ? "border border-peach px-4 font-medium text-peach"
              : "border-stroke text-secondaryText w-8 border",
            !!onStepClick && step > i && "cursor-pointer",
          )}
          onClick={() => onStepClick?.(i)}
        >
          {step === i ? item : i + 1}
        </button>
        {i !== steps.length - 1 && (
          <span className="text-secondaryText text-sm">&rsaquo;</span>
        )}
      </Fragment>
    ))}
  </div>
);

export enum Step {
  info,
  photo,
  video,
  review,
  finalized,
}

const totalCostOn = (
  chainId: SupportedChainId,
  arbitrationCost: bigint | undefined,
  contractData: FormProps["contractData"],
): bigint | null => {
  const data = contractData[chainId];
  return data && typeof arbitrationCost === "bigint"
    ? BigInt(data.baseDeposit) + arbitrationCost
    : null;
};

export type EmailSubmissionStatus =
  | "idle"
  | "saving"
  | "saved"
  | "unchanged"
  | "failed"
  | "skipped";

export interface MediaState {
  photo: { uri: string; content: Blob } | null;
  video: { uri: string; content: Blob } | null;
}

export interface SubmissionState {
  pohId: Hash;
  name: string;
}

export interface FormProps {
  contractData: Record<SupportedChainId, ContractData | null>;
  renewal?: RegistrationQuery["registration"] & {
    chain: SupportedChain;
  };
  hasPastVerifiedClaim?: boolean;
}

/** A successful IPFS upload, keyed by what produced it so an unchanged
 * re-submit can reuse the pin instead of uploading again. */
type PinnedUpload = { key: unknown; uri: string };

export default function Form(props: FormProps) {
  const chainId = useChainId() as SupportedChainId;

  if (!props.contractData[chainId])
    return (
      <span className="text-primaryText m-auto flex flex-col items-center gap-2 py-16 text-center">
        <span className="font-semibold">
          Request data for this network is currently unavailable.
        </span>
        <span className="text-secondaryText text-sm">
          Please switch to another network or try again later.
        </span>
      </span>
    );

  return <FormContent {...props} />;
}

function FormContent({
  contractData,
  renewal,
  hasPastVerifiedClaim = false,
}: FormProps) {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [initialAddress] = useState(() => address);
  const router = useRouter();
  const chainId = useChainId() as SupportedChainId;
  const wagmiConfig = useConfig();

  const { uploadFile: uploadToIPFS } = useAtlasProvider();
  // Off-chain notification email opt-in.
  const { mutateAsync: submitEmail } = useSubmitEmail();
  const currentContractData = contractData[chainId]!;
  const isRenewal = !!renewal;

  const { data: currentArbitrationCost } = useReadContract({
    address: currentContractData.arbitrationInfo.arbitrator as `0x${string}`,
    abi: getContractInfo("KlerosLiquid", chainId).abi as Abi,
    functionName: "arbitrationCost",
    args: [currentContractData.arbitrationInfo.extraData as Hash],
    chainId,
  });

  const step$ = useObservable(Step.info);
  const step = step$.use();
  const media$ = useObservable<MediaState>({ photo: null, video: null });
  // Held here (not in Info) so consents/radio/sub-screen survive step changes.
  const infoState$ = useObservable<InfoState>({
    stage: "details",
    dataConsent: false,
    requestNotice: false,
    recoverMode: hasPastVerifiedClaim,
  });
  const media = media$.use();
  const state$ = useObservable<SubmissionState>({
    pohId: machinifyId(params.pohid as string)!,
    name: "",
  });
  const state = state$.use();
  const email$ = useObservable("");
  const currentTotalCost = totalCostOn(
    chainId,
    currentArbitrationCost as bigint | undefined,
    contractData,
  );
  const funding$ = useObservable<Funding>("full");
  useEffect(() => {
    const funding = funding$.peek();
    if (funding !== "free" && funding !== "full") funding$.set("full");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);
  const loading = useLoading();
  const [, loadingMessage] = loading.use();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailSubmissionStatus>("idle");
  // Last step value already mirrored into the history stack; null until the
  // mount-time replaceState has run.
  const syncedStep = useRef<Step | null>(null);
  const uploadCache = useRef<
    Record<"photo" | "video" | "file" | "registration", PinnedUpload | null>
  >({
    photo: null,
    video: null,
    file: null,
    registration: null,
  });
  // While a transaction is in flight (or has succeeded) the wizard must not
  // move backwards, whatever initiated the move.
  const navigationLocked = !!loadingMessage || registrationComplete;
  const canGoBack =
    step > Step.info && step < Step.finalized && !navigationLocked;

  const goToStep = (target: Step) => {
    if (!canGoBack || target >= step) return;
    window.history.go(target - step);
  };

  const goBack = () => goToStep(step - 1);

  const saveNotificationEmail = useCallback(async () => {
    const email = email$.peek().trim();
    if (!email || !isValidEmailAddress(email)) {
      setEmailStatus(email ? "failed" : "skipped");
      return false;
    }

    loading.start("Enabling notifications");
    setEmailStatus("saving");
    try {
      const wasUpdated = await submitEmail({ nextEmail: email });
      loading.stop();
      setEmailStatus(wasUpdated ? "saved" : "unchanged");
      return true;
    } catch {
      loading.stop();
      setEmailStatus("failed");
      return false;
    }
  }, [email$, loading, submitEmail]);

  const settleEmail = useCallback(
    async ({ skip = false } = {}) => {
      if (skip || !email$.peek().trim()) {
        setEmailStatus("skipped");
        step$.set(Step.finalized);
        return;
      }
      if (await saveNotificationEmail()) step$.set(Step.finalized);
    },
    [email$, saveNotificationEmail, step$],
  );

  const finishRegistration = useCallback(async () => {
    setRegistrationComplete(true);
    toast.success("Request created");
    await settleEmail();
  }, [settleEmail]);

  const events = useMemo<Effects>(
    () => ({
      onError(error, errorCtx) {
        loading.stop();
        toast.error(getWriteErrorMessage(error, errorCtx));
      },
      onLoading() {
        toast.info("Transaction pending");
      },
      onSuccess() {
        loading.stop();
        finishRegistration();
      },
      onFail() {
        loading.stop();
        toast.error(
          "Transaction preparation failed. You may have insufficient funds or are on the wrong network.",
        );
      },
      onReady(fire) {
        fire();
      },
    }),
    [loading, finishRegistration],
  );

  const [prepareClaimHumanity] = usePoHWrite("claimHumanity", events);
  const [prepareRenewHumanity] = usePoHWrite("renewHumanity", events);

  const fetchLiveDeposit = async () => {
    const liveChainId = getChainId(wagmiConfig) as SupportedChainId;
    const liveChain = idToChain(liveChainId);
    const liveContractData = contractData[liveChainId];
    if (!liveChain || !liveContractData) return null;
    const arbitrationCost = await getArbitrationCost(
      liveChain,
      liveContractData.arbitrationInfo.arbitrator as `0x${string}`,
      liveContractData.arbitrationInfo.extraData as Hash,
    ).catch(() => undefined);
    const totalCost = totalCostOn(liveChainId, arbitrationCost, contractData);
    return totalCost !== null ? { chainId: liveChainId, totalCost } : null;
  };

  // Upload-once: skips the pin when `key` still matches the slot's last
  // successful upload, so a retry after a late failure never re-uploads
  // unchanged media.
  const pinOnce = async (
    slot: keyof typeof uploadCache.current,
    key: unknown,
    upload: () => Promise<string | null | undefined>,
  ) => {
    const cached = uploadCache.current[slot];
    if (cached && cached.key === key) return cached.uri;
    const uri = await upload();
    if (uri) uploadCache.current[slot] = { key, uri };
    return uri;
  };

  const submit = async () => {
    const { photo, video } = media;
    if (!photo || !video) return;
    const infoState = infoState$.peek();
    if (
      !state$.name.peek().trim() ||
      (infoState.recoverMode && !hasPastVerifiedClaim) ||
      !infoState.dataConsent ||
      !infoState.requestNotice
    ) {
      toast.error("Complete the Start step before submitting.");
      goToStep(Step.info);
      return;
    }
    if (!currentTotalCost) {
      toast.error("Unable to load the deposit amount. Please try again.");
      return;
    }

    const abort = (message: string) => {
      toast.error(message);
      loading.stop();
    };
    const requestType = isRenewal ? "renewal" : "registration";
    loading.start("Uploading media");
    try {
      const [photoUri, videoUri] = await Promise.all([
        pinOnce("photo", photo.content, () =>
          uploadToIPFS(photo.content as File, Roles.Photo),
        ),
        pinOnce("video", video.content, () =>
          uploadToIPFS(video.content as File, Roles.IdentificationVideo),
        ),
      ]);
      if (!photoUri || !videoUri) return abort("Failed to upload media.");

      const fileJson = JSON.stringify({
        name: state.name,
        photo: photoUri,
        video: videoUri,
      });
      const fileURI = await pinOnce("file", fileJson, () =>
        uploadToIPFS(
          new File([fileJson], "file", { type: "text/plain" }),
          Roles.Evidence,
        ),
      );
      if (!fileURI) return abort("Failed to upload media metadata.");

      loading.start("Uploading evidence files");
      const registrationJson = JSON.stringify({
        name: "Registration",
        fileURI,
      });
      const registrationUri = await pinOnce("registration", fileURI, () =>
        uploadToIPFS(
          new File([registrationJson], "registration", {
            type: "text/plain",
          }),
          Roles.Evidence,
        ),
      );
      if (!registrationUri) return abort(`Failed to upload ${requestType}.`);

      loading.start("Submitting...");
      const liveDeposit = await fetchLiveDeposit();
      if (!liveDeposit)
        return abort("Unable to load the deposit amount. Please try again.");
      if (getChainId(wagmiConfig) !== liveDeposit.chainId)
        return abort("Network changed. Please submit again.");
      if (liveDeposit.totalCost !== currentTotalCost)
        return abort(
          "The required deposit changed while uploading. Please review and submit again.",
        );
      const funded = computeFundingWei(funding$.peek(), liveDeposit.totalCost);
      if (funded === null)
        return abort(
          "Invalid deposit amount. Please review the deposit field.",
        );
      if (isRenewal)
        prepareRenewHumanity({
          value: funded,
          args: [registrationUri],
        });
      else
        prepareClaimHumanity({
          value: funded,
          args: [state$.pohId.peek(), registrationUri, state$.name.peek()],
        });
    } catch (error) {
      abort(
        `Failed to upload ${requestType}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  useEffect(() => {
    if (syncedStep.current === null) {
      window.history.replaceState(
        { ...(window.history.state ?? {}), claimStep: step },
        "",
      );
    } else if (step !== syncedStep.current) {
      window.history.pushState(
        { ...(window.history.state ?? {}), claimStep: step },
        "",
      );
    }
    syncedStep.current = step;
  }, [step]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const targetStep = event.state?.claimStep;
      if (typeof targetStep !== "number") return;

      const currentStep = step$.peek();
      if (navigationLocked && targetStep < currentStep) {
        // Browser back during an in-flight (or completed) transaction:
        // undo the pop so history stays aligned with the locked wizard.
        window.history.go(currentStep - targetStep);
        return;
      }

      syncedStep.current = targetStep;
      step$.set(targetStep);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [step$, navigationLocked]);

  useEffect(() => {
    if (!initialAddress) return;
    if (!address) {
      router.replace("/");
    } else if (
      !renewal &&
      initialAddress.toLowerCase() !== address.toLowerCase()
    ) {
      router.replace(`/${address}`);
    }
  }, [address, initialAddress, renewal, router]);

  useEffect(() => {
    if (
      renewal ||
      hasPastVerifiedClaim ||
      !address ||
      state.pohId.toLowerCase() === address.toLowerCase()
    )
      return;
    router.replace(`/${address}/claim`);
  }, [renewal, hasPastVerifiedClaim, address, state.pohId, router]);

  if (
    !isConnected ||
    (renewal &&
      (renewal.claimer.id !== address!.toLowerCase() ||
        renewal.chain.id !== chainId))
  )
    return (
      <>
        <Stepper step={0} />
        <Connect
          renewalAddress={renewal?.claimer.id}
          renewalChain={renewal?.chain}
        />
      </>
    );

  return (
    <>
      <Show if={() => step !== Step.finalized}>
        {() => (
          <Stepper step={step} onStepClick={canGoBack ? goToStep : undefined} />
        )}
      </Show>

      <Switch value={step$}>
        {{
          [Step.info]: () => (
            <InfoStep
              // Normalize here so every downstream consumer (IPFS metadata and
              // the on-chain claim args) gets the same trimmed name.
              advance={() => {
                state$.name.set(state$.name.peek().trim());
                step$.set(Step.photo);
              }}
              state$={state$}
              email$={email$}
              infoState$={infoState$}
              isRenewal={isRenewal}
              isRecovery={hasPastVerifiedClaim}
            />
          ),
          [Step.photo]: () => (
            <PhotoStep
              advance={() => step$.set(Step.video)}
              onBack={canGoBack ? goBack : undefined}
              photo$={media$.photo}
            />
          ),
          [Step.video]: () => (
            <VideoStep
              advance={() => step$.set(Step.review)}
              onBack={canGoBack ? goBack : undefined}
              video$={media$.video}
              isRenewal={!!renewal}
              videoError={(ErrMsg) => toast.error(ErrMsg)}
            />
          ),
          [Step.review]: () => (
            <ReviewStep
              totalCost={currentTotalCost}
              contractData={contractData}
              state$={state$}
              arbitrationInfo={currentContractData.arbitrationInfo}
              media$={media$}
              funding$={funding$}
              loadingMessage={loadingMessage}
              goBack={goBack}
              submit={submit}
              registrationComplete={registrationComplete}
              email$={email$}
              emailStatus={emailStatus}
              retryEmail={() => settleEmail()}
              skipEmail={() => settleEmail({ skip: true })}
              isRenewal={isRenewal}
            />
          ),
          [Step.finalized]: () => (
            <Finalized
              requiredVouches={currentContractData.requiredNumberOfVouches}
              challengePeriodDuration={Number(
                currentContractData.challengePeriodDuration,
              )}
              pohId={params.pohid as string}
              email={email$.peek().trim()}
              emailStatus={emailStatus}
              isRenewal={isRenewal}
            />
          ),
        }}
      </Switch>

      {registrationComplete && emailStatus === "failed" && (
        <div className="mt-4 flex justify-center">
          <ActionButton
            onClick={() => settleEmail({ skip: true })}
            label="Skip for now"
            variant="secondary"
            className="w-full max-w-xs"
          />
        </div>
      )}
    </>
  );
}
