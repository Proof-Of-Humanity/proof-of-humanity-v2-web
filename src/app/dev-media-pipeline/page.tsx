"use client";

import { ObservableObject } from "@legendapp/state";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { useObservable } from "@legendapp/state/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-toastify";

const PhotoStep = dynamic(() => import("../[pohid]/claim/Photo"), { ssr: false });
const VideoStep = dynamic(() => import("../[pohid]/claim/Video"), { ssr: false });

enableReactUse();

type MediaFile = { uri: string; content: Blob } | null;

export default function DevMediaPipelinePage() {
  const media$ = useObservable<{ photo: MediaFile; video: MediaFile }>({
    photo: null,
    video: null,
  });
  const [step, setStep] = useState<"photo" | "video">("photo");

  return (
    <div className="content paper flex flex-col gap-4 px-4 py-4 sm:px-8 sm:py-6">
      <h1 className="text-xl font-semibold">Dev Media Pipeline Harness</h1>
      <div className="flex gap-2">
        <button className="btn-main" onClick={() => setStep("photo")}>
          Photo Step
        </button>
        <button className="btn-main" onClick={() => setStep("video")}>
          Video Step
        </button>
      </div>

      {step === "photo" ? (
        <PhotoStep
          advance={() => setStep("video")}
          photo$={media$.photo as unknown as ObservableObject<MediaFile>}
        />
      ) : (
        <VideoStep
          advance={() => toast.success("Advance clicked")}
          video$={media$.video as unknown as ObservableObject<MediaFile>}
          isRenewal={false}
          videoError={(msg) => toast.error(msg)}
        />
      )}
    </div>
  );
}
