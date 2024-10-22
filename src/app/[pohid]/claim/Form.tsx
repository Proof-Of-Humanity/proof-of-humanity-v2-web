"use client";

import { Fragment, useMemo } from "react";
import Finalized from "./Finalized";
import InfoStep from "./Info";
import PhotoStep from "./Photo";
import ReviewStep from "./Review";
import VideoStep from "./Video";
import { Show, Switch, useObservable } from "@legendapp/state/react";
import { useAccount, useChainId } from "wagmi";
import withClientConnected from "components/HighOrder/withClientConnected";
import { useParams } from "next/navigation";
import { Hash, parseEther } from "viem";
import cn from "classnames";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import Connect from "./Connect";
import { SupportedChain, SupportedChainId } from "config/chains";
import { RegistrationQuery } from "generated/graphql";
import usePoHWrite from "contracts/hooks/usePoHWrite";
import { toast } from "react-toastify";
import { machinifyId } from "utils/identifier";
import { Effects } from "contracts/hooks/types";
import { uploadToIPFS } from "utils/ipfs";
import { useLoading } from "hooks/useLoading";
import { ContractData } from "data/contract";

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

export default withClientConnected<FormProps & JSX.IntrinsicAttributes>(
  function Form({ contractData, totalCosts, renewal }) {
    const params = useParams();
    const { address, isConnected } = useAccount();
    const chainId = useChainId() as SupportedChainId;

    const step$ = useObservable(Step.info);
    const media$ = useObservable<MediaState>({ photo: null, video: null });
    const media = media$.use();
    const state$ = useObservable<SubmissionState>({
      pohId: machinifyId(params.pohid as string)!,
      name: "",
      uri: "",
    });
    const state = state$.use();
    const selfFunded$ = useObservable(0);
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

      let data = new FormData();
      data.append("###", "file.json");
      data.append("name", state.name);
      data.append("photo", media.photo.content);
      data.append("video", media.video.content);

      const fileURI = await uploadToIPFS(data);

      loading.start("Uploading evidence files");

      data = new FormData();
      data.append("###", "registration.json");
      data.append("name", "Registration");
      data.append("fileURI", fileURI);

      state$.uri.set(await uploadToIPFS(data));

      loading.stop();
    };

    state$.onChange(({ value }) => {
      if (!value.uri) return;
      const selfFundedWei = BigInt(parseEther(selfFunded.toString()));
      const funded =
        selfFundedWei > totalCosts[chainId]
          ? totalCosts[chainId]
          : selfFundedWei;
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
  },
);
