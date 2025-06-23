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
import { Effects } from "contracts/hooks/types";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { ContractData } from "data/contract";
import { RegistrationQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import { RedirectType } from "next/dist/client/components/redirect";
import { redirect, useParams } from "next/navigation";
import { Fragment, MutableRefObject, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { machinifyId } from "utils/identifier";
import { Hash, parseEther } from "viem";
import { useAccount, useChainId } from "wagmi";
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

export interface MediaState {
  photo: { uri: string; content: Blob } | null;
  video: { uri: string; content: Blob } | null;
}

export interface SubmissionState {
  pohId: Hash;
  name: string;
  uri: string;
}

interface FormProps {
  contractData: Record<SupportedChainId, ContractData>;
  totalCosts: Record<SupportedChainId, bigint>;
  renewal?: RegistrationQuery["registration"] & {
    chain: SupportedChain;
  };
}

export default function Form({ contractData, totalCosts, renewal }: FormProps) {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const initiatingAddress: MutableRefObject<typeof address> =
    useRef(undefined);
  const chainId = useChainId() as SupportedChainId;

  const { uploadFile: uploadToIPFS } = useAtlasProvider();

  const step$ = useObservable(Step.info);
  const media$ = useObservable<MediaState>({ photo: null, video: null });
  const media = media$.use();
  const state$ = useObservable<SubmissionState>({
    pohId: machinifyId(params.pohid as string)!,
    name: "",
    uri: "",
  });
  const state = state$.use();
  const selfFunded$ = useObservable(formatEth(totalCosts[chainId]));
  const selfFunded = selfFunded$.use();
  const loading = useLoading();
  const [, loadingMessage] = loading.use();

  const events = useMemo<Effects>(
    () => ({
      onError() {
        loading.stop();
        toast.error("Transaction rejected");
      },
      onLoading() {
        toast.info("Transaction pending");
      },
      onSuccess() {
        step$.set(Step.finalized);
        toast.success("Request created");
      },
      onFail() {
        loading.stop();
        toast.error("Transaction preparation failed. You may have insufficient funds or are on the wrong network.");
      },
      onReady(fire) {
        fire();
        toast.info("Transaction pending");
      },
    }),
    [step$, loading],
  );

  const [prepareClaimHumanity] = usePoHWrite("claimHumanity", events);
  const [prepareRenewHumanity] = usePoHWrite("renewHumanity", events);

  const submit = async () => {
    if (!media.photo || !media.video) return;

    loading.start("Uploading media");
  try{
    const photoFile = media.photo.content as File;
    const videoFile = media.video.content as File;

    const [photoUri, videoUri] = await Promise.all([
        uploadToIPFS(photoFile, Roles.Photo),
        uploadToIPFS(videoFile, Roles.IdentificationVideo),
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
      fileURI: fileURI,
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
        Roles.Evidence
      );
    if (!registrationUri) {
      toast.error("Failed to upload registration.");
      loading.stop();
      return;
    }

    state$.uri.set(registrationUri);

   } catch (error) {
      toast.error(`Failed to upload registration : ${error instanceof Error ? error.message : "Unknown error"}`);
      loading.stop();
      return;
    }
  };

  state$.onChange(({ value }) => {
    if (!value.uri) return;
    const selfFundedWei = BigInt(parseEther(selfFunded$.get().toString()));
    const funded =
      selfFundedWei > totalCosts[chainId]
        ? totalCosts[chainId]
        : selfFundedWei;
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

  // const steps = useMemo(
  //   () =>
  //     renewal
  //       ? ["Photo", "Video", "Review"]
  //       : ["Info", "Photo", "Video", "Review"],
  //   [renewal]
  // );

  useEffectOnce(() => {
    initiatingAddress.current = address;
  });

  useEffect(() => {
    if (initiatingAddress.current) {
      if (
        !renewal &&
        address &&
        initiatingAddress.current.toLowerCase() !== address.toLowerCase()
      ) {
        redirect(`/${address}`, RedirectType.replace);
      } else if (!address) {
        redirect('/', RedirectType.replace);
      }
    }
  }, [address, initiatingAddress, renewal]);

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
      <Show if={() => step$.get() !== Step.finalized}>
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
                          step$.get() < i,
                        "gradient px-2 font-bold uppercase text-white":
                          step$.get() === i,
                        "gradient w-6 cursor-pointer font-bold text-white":
                          step$.get() > i,
                      },
                    )}
                    onClick={() => step$.get() > i && step$.set(i)}
                  >
                    {`${i + 1}${step$.get() === i ? `. ${item}` : ""}`}
                  </div>
                </div>
                {i !== steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-full",
                      step$.get() > i ? "gradient" : "bg-slate-200",
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
            <InfoStep advance={() => step$.set(Step.photo)} state$={state$} />
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
              totalCost={totalCosts[chainId]}
              state$={state$}
              arbitrationInfo={contractData[chainId].arbitrationInfo}
              media$={media$}
              selfFunded$={selfFunded$}
              loadingMessage={loadingMessage}
              submit={submit}
            />
          ),
          [Step.finalized]: () => (
            <Finalized
              requiredVouches={contractData[chainId].requiredNumberOfVouches}
            />
          ),
        }}
      </Switch>
    </>
  );
}
