"use client";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { Show, Switch, useObservable } from "@legendapp/state/react";
import cn from "classnames";
import { getAtlasError, getAuthedAtlasSdk } from "config/atlas";
import { SupportedChain, SupportedChainId } from "config/chains";
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import {
  clearReferral,
  getStoredReferral,
  refereeHasClaimRequest,
} from "data/referralAttribution";
import { getMyDataStrict } from "data/user";
import { RegistrationQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import Link from "next/link";
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
import { Hash, formatEther } from "viem";
import { useAccount, useChainId, useConfig } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useTotalCost } from "./useTotalCost";
import { getAccount, getChainId } from "wagmi/actions";
import ActionButton from "components/ActionButton";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";
import { isValidEmailAddress } from "utils/validators";
import Connect from "./Connect";
import Finalized from "./Finalized";
import FormSkeleton from "./FormSkeleton";
import { resolveFunding } from "utils/funding";
import InfoStep, { InfoState } from "./Info";
import { ClaimGate, resolveClaimIntent, resolveRenewalGate } from "./intent";
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
          aria-label={item}
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
  name: string;
}

export interface FormProps {
  contractData: Record<SupportedChainId, ContractData | null>;
  renewal?: RegistrationQuery["registration"] & {
    chain: SupportedChain;
  };
  hasPastVerifiedClaim?: boolean;
  humanityActiveOnAnyChain?: boolean;
  pendingClaimers?: string[];
}

/** An IPFS upload keyed by its inputs; an unchanged re-submit reuses the pin. */
type PinnedUpload = { key: unknown; uri: string };

export default function Form(props: FormProps) {
  const params = useParams();
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

  return <FormContent key={String(params.pohid)} {...props} />;
}

function FormContent({
  contractData,
  renewal,
  hasPastVerifiedClaim = false,
  humanityActiveOnAnyChain = false,
  pendingClaimers,
}: FormProps) {
  const params = useParams();
  const urlPohId = machinifyId(params.pohid as string)!;
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const chainId = useChainId() as SupportedChainId;
  const wagmiConfig = useConfig();

  const { uploadFile: uploadToIPFS } = useAtlasProvider();
  const { mutateAsync: submitEmail } = useSubmitEmail();
  const currentContractData = contractData[chainId]!;
  const isRenewal = !!renewal;

  const { data: totalCost } = useTotalCost(chainId, contractData);

  const step$ = useObservable(Step.info);
  const step = step$.use();
  const media$ = useObservable<MediaState>({ photo: null, video: null });
  // Held here (not in Info) so consents/radio/sub-screen survive step changes.
  const infoState$ = useObservable<InfoState>({
    stage: "details",
    dataConsent: false,
    requestNotice: false,
    recoverMode: hasPastVerifiedClaim ? null : false,
  });
  const media = media$.use();
  const state$ = useObservable<SubmissionState>({ name: "" });
  const state = state$.use();
  const email$ = useObservable("");
  const funding$ = useObservable("");
  useEffect(() => {
    funding$.set(totalCost != null ? formatEther(totalCost) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, totalCost]);
  const loading = useLoading();
  const [, loadingMessage] = loading.use();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailSubmissionStatus>("idle");
  const claimingOwnHumanity = !!address && urlPohId === address.toLowerCase();
  // Null until the mount-time replaceState has run.
  const syncedStep = useRef<Step | null>(null);
  const uploadCache = useRef<
    Record<"photo" | "video" | "file" | "registration", PinnedUpload | null>
  >({
    photo: null,
    video: null,
    file: null,
    registration: null,
  });
  // Never move backwards while a transaction is in flight (or succeeded).
  const navigationLocked = !!loadingMessage || registrationComplete;
  const canGoBack =
    step > Step.info && step < Step.finalized && !navigationLocked;

  const {
    data: me,
    error: meError,
    refetch: retryMe,
  } = useQuery({
    queryKey: ["myDataStrict", address],
    queryFn: () => getMyDataStrict(address!),
    // Renewal never consults the preflight, so don't let it fetch (or fail).
    enabled: !!address && isConnected && !renewal,
  });

  const recoverMode = infoState$.recoverMode.use();
  const wallet = address && isConnected ? { address, chainId } : null;
  const gate: ClaimGate | null = renewal
    ? resolveRenewalGate({
        urlPohId,
        connectedWallet: wallet,
        registrationToRenew: {
          claimer: String(renewal.claimer.id),
          chainId: renewal.chain.id,
        },
      })
    : !wallet
      ? { type: "connect" }
      : me
        ? resolveClaimIntent({
            urlPohId,
            connectedWallet: wallet,
            hasPastVerifiedClaim,
            selectedMode:
              recoverMode === null ? null : recoverMode ? "recover" : "create",
            walletActivePohId: (me.pohId as Hash | undefined) ?? null,
            humanityActiveOnAnyChain,
          })
        : null; // preflight still in flight (or failed — handled at render)
  const intent = gate?.type === "proceed" ? gate.intent : null;

  const competingClaims = (pendingClaimers ?? []).filter(
    (claimer) => claimer.toLowerCase() !== address?.toLowerCase(),
  ).length;

  // Single navigation effect; frozen while a transaction is in flight.
  const navigateTo =
    !navigationLocked && gate?.type === "navigate" ? gate.to : null;
  useEffect(() => {
    if (navigateTo) router.replace(navigateTo);
  }, [navigateTo, router]);

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

  // Reuses the last pin when `key` is unchanged.
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

  /**
   * Links the stored referral on Atlas before the registration tx.
   * @returns whether submit may continue. `false` keeps the pin (dismiss or
   *   retry). `true` clears it once linked, already attributed, or payout
   *   can never succeed (prior claim).
   */
  const attributeReferral = async () => {
    if (isRenewal || !claimingOwnHumanity) return true;
    const referral = getStoredReferral(urlPohId);
    if (!referral) return true;
    // First claim already exists: Atlas would link, payout would still reject.
    if (await refereeHasClaimRequest(urlPohId)) {
      clearReferral(urlPohId);
      return true;
    }
    if (referral.referrerHumanityId === urlPohId) {
      toast.error("You can't refer yourself. Remove the referral to continue.");
      return false;
    }

    loading.start("Linking referral");
    try {
      // await getAuthedAtlasSdk().LinkReferralAttribution({
      //   referrerHumanityId: referral.referrerHumanityId,
      // });
      toast.info(
        `Would link referral ${referral.referrerHumanityId} (Atlas call skipped)`,
      );
      clearReferral(urlPohId);
      return true;
    } catch (error) {
      loading.stop();
      const { message, code } = getAtlasError(error);
      if (code === "PohReferralAlreadyAttributedError") {
        toast.info(
          "This account already has a referral attribution. Continuing registration.",
        );
        clearReferral(urlPohId);
        return true;
      }
      if (
        code === "PohReferralSelfReferralError" ||
        code === "PohReferralReferrerNotHumanError"
      ) {
        toast.error(
          message ?? "This referral can't be used. Remove it to continue.",
        );
        return false;
      }
      toast.error(
        "Referral isn't available right now. Remove the referral to register now, or come back later to keep it.",
      );
      return false;
    }
  };

  const submit = async () => {
    const { photo, video } = media;
    if (!photo || !video) return;
    // Snapshot at click time; re-checked against live wagmi state before the write.
    if (!intent || !address) return;
    const snapshot = { address, chainId, intent };
    const infoState = infoState$.peek();
    if (
      !state$.name.peek().trim() ||
      !infoState.dataConsent ||
      !infoState.requestNotice
    ) {
      toast.error("Complete the Start step before submitting.");
      goToStep(Step.info);
      return;
    }
    if (totalCost === undefined) {
      toast.error("Unable to load the deposit amount. Please try again.");
      return;
    }
    if (!(await attributeReferral())) return;

    const abort = (message: string) => {
      toast.error(message);
      loading.stop();
    };
    const requestType =
      snapshot.intent.kind === "renew" ? "renewal" : "registration";
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
      // Uploads take a while — refuse to write if the wallet or network moved since the click.
      const liveAddress = getAccount(wagmiConfig).address;
      if (liveAddress?.toLowerCase() !== snapshot.address.toLowerCase())
        return abort("Wallet changed. Please review and submit again.");
      if (getChainId(wagmiConfig) !== snapshot.chainId)
        return abort("Network changed. Please submit again.");
      const { wei: funded, overCap } = resolveFunding(
        funding$.peek(),
        totalCost ?? null,
      );
      if (funded === null)
        return abort(
          "Invalid deposit amount. Please review the deposit field.",
        );
      // Review already blocks this, but never silently send an amount that
      // differs from the one on screen.
      if (overCap)
        return abort(
          "Deposit amount exceeds the required deposit. Please review the deposit field.",
        );
      if (snapshot.intent.kind === "renew")
        prepareRenewHumanity({
          value: funded,
          args: [registrationUri],
        });
      else
        prepareClaimHumanity({
          value: funded,
          args: [snapshot.intent.urlPohId, registrationUri, state$.name.peek()],
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
        // Undo the pop so history stays aligned with the locked wizard.
        window.history.go(currentStep - targetStep);
        return;
      }

      syncedStep.current = targetStep;
      step$.set(targetStep);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [step$, navigationLocked]);

  // Frozen once a transaction is in flight (or done); never tear down the receipt UI.
  if (!navigationLocked) {
    if (gate?.type === "connect")
      return (
        <>
          <Stepper step={0} />
          <Connect
            renewalAddress={renewal?.claimer.id}
            renewalChain={renewal?.chain}
          />
        </>
      );
    if (meError)
      return (
        <>
          <div className="text-primaryText m-auto flex flex-col items-center gap-2 py-16 text-center">
            <span className="font-semibold">
              We couldn&apos;t check this wallet&apos;s registration status.
            </span>
            <span className="text-secondaryText text-sm">
              The check protects your deposit. Please retry.
            </span>
            <ActionButton
              onClick={() => retryMe()}
              label="Retry"
              variant="secondary"
              className="mt-4 min-w-[170px]"
            />
          </div>
        </>
      );
    // Neutral placeholder — never flash a foreign Humanity ID in a create wizard.
    if (!gate || gate.type === "navigate")
      return (
        <>
          <FormSkeleton />
        </>
      );
    if (gate.type === "blocked")
      return (
        <>
          <div className="text-primaryText m-auto flex flex-col items-center gap-2 py-16 text-center">
            {gate.reason === "already-registered" ? (
              <>
                <span className="font-semibold">
                  This wallet already has an active Proof of Humanity profile.
                </span>
                <span className="text-secondaryText text-sm">
                  A wallet can only hold one Humanity ID at a time.
                </span>
                <Link
                  href={`/${gate.profileId}`}
                  className="text-orange mt-2 text-sm font-semibold hover:underline"
                >
                  View your profile
                </Link>
              </>
            ) : (
              <>
                <span className="font-semibold">
                  This Humanity ID can&apos;t be recovered right now.
                </span>
                <span className="text-secondaryText text-sm">
                  Its registration is still active. A Humanity ID can only be
                  recovered after it expires.
                </span>
              </>
            )}
          </div>
        </>
      );
  }

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
              advance={() => {
                state$.name.set(state$.name.peek().trim());
                step$.set(Step.photo);
              }}
              state$={state$}
              email$={email$}
              infoState$={infoState$}
              pohId={urlPohId}
              competingClaims={competingClaims}
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
              contractData={contractData}
              pohId={urlPohId}
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
    </>
  );
}
