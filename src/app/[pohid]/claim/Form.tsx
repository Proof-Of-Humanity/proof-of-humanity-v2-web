"use client";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import {
  Show,
  Switch,
  useEffectOnce,
  useObservable,
} from "@legendapp/state/react";
import cn from "classnames";
import { SupportedChain, SupportedChainId } from "config/chains";
import { getContractInfo } from "contracts";
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { RegistrationQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import { redirect, RedirectType, useParams } from "next/navigation";
import {
  Fragment,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { machinifyId } from "utils/identifier";
import { Abi, Hash, parseEther } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import ActionButton from "components/ActionButton";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";
import { isValidEmailAddress } from "utils/validators";
import Connect from "./Connect";
import Finalized from "./Finalized";
import InfoStep from "./Info";
import PhotoStep from "./Photo";
import ReviewStep from "./Review";
import VideoStep from "./Video";
import { formatEth } from "utils/misc";

enableReactUse();

const steps = ["Info", "Photo", "Video", "Review"];

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

type UploadedMediaCache = {
  content: Blob;
  uri: string;
};

export interface SubmissionState {
  pohId: Hash;
  name: string;
  uri: string;
}

export interface FormProps {
  contractData: Record<SupportedChainId, ContractData | null>;
  fallbackTotalCosts: Record<SupportedChainId, string>;
  renewal?: RegistrationQuery["registration"] & {
    chain: SupportedChain;
  };
  hasPastVerifiedClaim?: boolean;
}

export default function Form(props: FormProps) {
  const chainId = useChainId() as SupportedChainId;

  if (!props.contractData[chainId])
    return (
      <span className="text-primaryText m-auto flex flex-col items-center gap-2 py-16 text-center">
        <span className="font-semibold">
          Registration data for this network is currently unavailable.
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
  fallbackTotalCosts,
  renewal,
  hasPastVerifiedClaim = false,
}: FormProps) {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const initiatingAddress: MutableRefObject<typeof address> = useRef(undefined);
  const chainId = useChainId() as SupportedChainId;

  const { uploadFile: uploadToIPFS } = useAtlasProvider();
  // Off-chain notification email opt-in.
  const { mutateAsync: submitEmail } = useSubmitEmail();
  const currentContractData = contractData[chainId]!;
  const currentBaseDeposit = BigInt(currentContractData.baseDeposit);
  const syncedFundingChainId = useRef<SupportedChainId | null>(null);

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
  const media = media$.use();
  const state$ = useObservable<SubmissionState>({
    pohId: machinifyId(params.pohid as string)!,
    name: "",
    uri: "",
  });
  const state = state$.use();
  const email$ = useObservable("");
  const currentTotalCost =
    typeof currentArbitrationCost === "bigint"
      ? currentBaseDeposit + currentArbitrationCost
      : fallbackTotalCosts[chainId]
        ? BigInt(fallbackTotalCosts[chainId])
        : null;
  const selfFunded$ = useObservable(0);
  const submitForFree$ = useObservable(false);
  const submitForFree = submitForFree$.use();
  const loading = useLoading();
  const [, loadingMessage] = loading.use();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailSubmissionStatus>("idle");
  const stepHistoryReady = useRef(false);
  const previousStepRef = useRef(Step.info);
  const uploadedMediaRef = useRef<
    Record<keyof MediaState, UploadedMediaCache | null>
  >({
    photo: null,
    video: null,
  });
  const canGoBack =
    step > Step.info &&
    step < Step.finalized &&
    !loadingMessage &&
    !registrationComplete;

  const goBack = () => {
    if (!canGoBack) return;
    step$.set(step - 1);
  };

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

  const finishRegistration = useCallback(async () => {
    setRegistrationComplete(true);
    toast.success("Request created");

    const email = email$.peek().trim();
    if (!email) {
      setEmailStatus("skipped");
      step$.set(Step.finalized);
      return;
    }

    const emailSaved = await saveNotificationEmail();
    if (emailSaved) step$.set(Step.finalized);
  }, [email$, saveNotificationEmail, step$]);

  const retryNotificationEmail = useCallback(async () => {
    const emailSaved = await saveNotificationEmail();
    if (emailSaved) step$.set(Step.finalized);
  }, [saveNotificationEmail, step$]);

  const skipNotificationEmail = useCallback(() => {
    setEmailStatus("skipped");
    step$.set(Step.finalized);
  }, [step$]);

  const events = useMemo<Effects>(
    () => ({
      onError() {
        state$.uri.set("");
        loading.stop();
        toast.error("Transaction rejected");
      },
      onLoading() {
        toast.info("Transaction pending");
      },
      onSuccess() {
        loading.stop();
        finishRegistration();
      },
      onFail() {
        state$.uri.set("");
        loading.stop();
        toast.error(
          "Transaction preparation failed. You may have insufficient funds or are on the wrong network.",
        );
      },
      onReady(fire) {
        fire();
      },
    }),
    [loading, state$, finishRegistration],
  );

  const [prepareClaimHumanity] = usePoHWrite("claimHumanity", events);
  const [prepareRenewHumanity] = usePoHWrite("renewHumanity", events);

  useEffect(() => {
    if (!currentTotalCost) return;
    if (syncedFundingChainId.current === chainId) return;

    selfFunded$.set(submitForFree ? 0 : formatEth(currentTotalCost));
    syncedFundingChainId.current = chainId;
  }, [chainId, currentTotalCost, selfFunded$, submitForFree]);

  const getUploadedMediaUri = async (
    type: keyof MediaState,
    mediaItem: NonNullable<MediaState[keyof MediaState]>,
    role: Roles,
  ) => {
    const cached = uploadedMediaRef.current[type];
    if (cached?.content === mediaItem.content) return cached.uri;

    const uri = await uploadToIPFS(mediaItem.content as File, role);
    if (uri) {
      uploadedMediaRef.current[type] = {
        content: mediaItem.content,
        uri,
      };
    }

    return uri;
  };

  const submit = async () => {
    if (!media.photo || !media.video) return;
    if (!currentTotalCost) {
      toast.error("Unable to load the deposit amount. Please try again.");
      return;
    }

    state$.uri.set("");
    loading.start("Uploading media");
    try {
      const [photoUri, videoUri] = await Promise.all([
        getUploadedMediaUri("photo", media.photo, Roles.Photo),
        getUploadedMediaUri("video", media.video, Roles.IdentificationVideo),
      ]);

      if (!photoUri || !videoUri) {
        toast.error("Failed to upload media.");
        loading.stop();
        return;
      }

      const fileJson = {
        name: state.name,
        photo: photoUri,
        video: videoUri,
      };

      const fileTextFile = new File([JSON.stringify(fileJson)], "file", {
        type: "text/plain",
      });

      let fileURI: string | null;
      fileURI = await uploadToIPFS(fileTextFile, Roles.Evidence);

      if (!fileURI) {
        toast.error("Failed to upload media metadata.");
        loading.stop();
        return;
      }

      loading.start("Uploading evidence files");

      const registrationJson = {
        name: "Registration",
        fileURI,
      };

      const registrationTextFile = new File(
        [JSON.stringify(registrationJson)],
        "registration",
        {
          type: "text/plain",
        },
      );

      let registrationUri: string | null;
      registrationUri = await uploadToIPFS(
        registrationTextFile,
        Roles.Evidence,
      );
      if (!registrationUri) {
        toast.error("Failed to upload registration.");
        loading.stop();
        return;
      }

      state$.uri.set(registrationUri);
    } catch (error) {
      toast.error(
        `Failed to upload registration : ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      loading.stop();
      return;
    }
  };

  useEffect(() => {
    const unsubscribe = state$.onChange(({ value }) => {
      if (!value.uri) return;
      if (!currentTotalCost) return;
      const selfFundedWei = BigInt(parseEther(selfFunded$.get().toString()));
      const funded =
        selfFundedWei > currentTotalCost ? currentTotalCost : selfFundedWei;
      loading.start("Submitting...");
      if (renewal)
        prepareRenewHumanity({
          value: funded,
          args: [value.uri],
        });
      else
        prepareClaimHumanity({
          value: funded,
          args: [value.pohId, value.uri, value.name],
        });
    });

    return () => unsubscribe();
  }, [
    currentTotalCost,
    loading,
    prepareClaimHumanity,
    prepareRenewHumanity,
    renewal,
    selfFunded$,
    state$,
  ]);

  useEffectOnce(() => {
    initiatingAddress.current = address;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!stepHistoryReady.current) {
      window.history.replaceState(
        { ...(window.history.state ?? {}), claimStep: step },
        "",
      );
      stepHistoryReady.current = true;
      previousStepRef.current = step;
      return;
    }

    if (step !== previousStepRef.current) {
      window.history.pushState(
        { ...(window.history.state ?? {}), claimStep: step },
        "",
      );
      previousStepRef.current = step;
    }
  }, [step]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = (event: PopStateEvent) => {
      const previousStep = event.state?.claimStep;
      if (typeof previousStep === "number") {
        previousStepRef.current = previousStep;
        step$.set(previousStep);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [step$]);

  useEffect(() => {
    if (initiatingAddress.current) {
      if (
        !renewal &&
        address &&
        initiatingAddress.current.toLowerCase() !== address.toLowerCase()
      ) {
        redirect(`/${address}`, RedirectType.replace);
      } else if (!address) {
        redirect("/", RedirectType.replace);
      }
    }
  }, [address, initiatingAddress, renewal]);

  useEffect(() => {
    if (
      renewal ||
      hasPastVerifiedClaim ||
      !address ||
      state.pohId.toLowerCase() === address.toLowerCase()
    )
      return;
    redirect(`/${address}/claim`, RedirectType.replace);
  }, [renewal, hasPastVerifiedClaim, address, state.pohId]);

  if (
    !isConnected ||
    (renewal &&
      (renewal.claimer.id !== address!.toLowerCase() ||
        renewal.chain.id !== chainId))
  )
    return (
      <Connect
        renewalAddress={renewal?.claimer.id}
        renewalChain={renewal?.chain}
      />
    );

  return (
    <>
      <Show if={() => step !== Step.finalized}>
        {() => (
          <div className="flex w-full cursor-default select-none items-center">
            {steps.map((item, i) => (
              <Fragment key={i}>
                <div className="m-1 flex items-center">
                  <div
                    className={cn(
                      "centered h-6 whitespace-nowrap rounded-full text-sm",
                      {
                        "w-6 border border-slate-200 font-bold text-slate-400":
                          step < i,
                        "gradient px-2 font-bold uppercase text-white":
                          step === i,
                        "gradient w-6 cursor-pointer font-bold text-white":
                          step > i && !registrationComplete,
                        "gradient w-6 font-bold text-white":
                          step > i && registrationComplete,
                      },
                    )}
                    onClick={() =>
                      !registrationComplete && step > i && step$.set(i)
                    }
                  >
                    {`${i + 1}${step === i ? `. ${item}` : ""}`}
                  </div>
                </div>
                {i !== steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-full",
                      step > i ? "gradient" : "bg-slate-200",
                    )}
                  />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </Show>

      <Switch value={step$}>
        {{
          [Step.info]: () => (
            <InfoStep
              advance={() => step$.set(Step.photo)}
              state$={state$}
              email$={email$}
            />
          ),
          [Step.photo]: () => (
            <PhotoStep
              advance={() => step$.set(Step.video)}
              photo$={media$.photo}
            />
          ),
          [Step.video]: () => (
            <VideoStep
              advance={() => step$.set(Step.review)}
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
              selfFunded$={selfFunded$}
              submitForFree$={submitForFree$}
              loadingMessage={loadingMessage}
              submit={submit}
              registrationComplete={registrationComplete}
              email$={email$}
              emailStatus={emailStatus}
              retryEmail={retryNotificationEmail}
              skipEmail={skipNotificationEmail}
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
            />
          ),
        }}
      </Switch>

      {(canGoBack || (registrationComplete && emailStatus === "failed")) && (
        <div className="mt-6 flex justify-center">
          <ActionButton
            onClick={
              registrationComplete && emailStatus === "failed"
                ? skipNotificationEmail
                : goBack
            }
            label={
              registrationComplete && emailStatus === "failed"
                ? "Skip for now"
                : "Back"
            }
            variant="secondary"
            className="w-full max-w-xs"
          />
        </div>
      )}
    </>
  );
}
