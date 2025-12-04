import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Webcam from "components/Webcam";
import getBlobDuration from "get-blob-duration";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import CameraIcon from "icons/CameraMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import Image from "next/image";
import React, { useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { toast } from "react-toastify";
import { IS_IOS, videoSanitizer } from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

const ALLOWED_VIDEO_TYPES = [
  "video/webm",
  "video/mp4",
  "video/avi",
  "video/mov",
];
const MIN_DIMS = { width: 352, height: 352 }; // PXs

const MAX_DURATION = 20; // Seconds
const MAX_SIZE = 10; // Megabytes
const MAX_SIZE_BYTES = MAX_SIZE ? 1024 * 1024 * MAX_SIZE : MAX_SIZE; // Bytes
const ERROR_MSG = {
  duration: `Video is too long. Maximum allowed duration is ${MAX_DURATION} seconds long`,
  dimensions: `Video dimensions are too small. Minimum dimensions are ${MIN_DIMS.width}px by ${MIN_DIMS.height}px`,
  size: `Video is oversized. Maximum allowed size is ${MAX_SIZE}mb`,
  fileType: `Unsupported video format. Please use ${ALLOWED_VIDEO_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
  unexpected: "Unexpected error. Check format/codecs used.",
};
interface PhotoProps {
  advance: () => void;
  video$: ObservableObject<MediaState["video"]>;
  isRenewal: boolean;
  videoError: (error: string) => void;
}

function VideoStep({ advance, video$, isRenewal, videoError }: PhotoProps) {
  const video = video$.use();

  const { address } = useAccount();

  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [recording, setRecording] = useState(false);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const checkVideoSize = (blob: Blob) => {
    if (MAX_SIZE_BYTES && blob.size > MAX_SIZE_BYTES) {
      videoError(ERROR_MSG.size);
      return console.error(ERROR_MSG.size);
    }
  };

  const checkVideoDuration = async (blob: Blob) => {
    const duration = await getBlobDuration(blob);
    if (duration > MAX_DURATION) {
      videoError(ERROR_MSG.duration);
      return console.error(ERROR_MSG.duration);
    }
  };

  const startRecording = () => {
    if (!camera || !camera.stream) return;
    const mediaRecorder = new MediaRecorder(camera.stream, {
      mimeType: IS_IOS ? 'video/mp4;codecs="h264"' : 'video/webm; codecs="vp8"',
    });

    mediaRecorder.ondataavailable = async ({ data }) => {
      loading.start("Processing video");

      const newlyRecorded = ([] as BlobPart[]).concat(data);
      const blob = new Blob(newlyRecorded, {
        type: IS_IOS ? 'video/mp4' : 'video/webm',
      });

      await checkVideoDuration(blob);
      checkVideoSize(blob);

      try {
        const buffer = await blob.arrayBuffer();
        const sanitized = await videoSanitizer(buffer);
        const sanitizedBlob = new Blob([new Uint8Array(sanitized as ArrayBuffer)], { type: 'video/mp4' });

        video$.set({ content: sanitizedBlob, uri: URL.createObjectURL(sanitizedBlob) });
        setShowCamera(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to process video");
        console.error("Video sanitization error:", err);
      } finally {
        loading.stop();
      }
    };

    mediaRecorder.onstop = async () => {
      setFullscreen(false);
      setRecording(false);
    };

    mediaRecorder.start();

    setRecorder(mediaRecorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (!recorder || !recording) return;
    recorder.stop();
  };

  const retakeVideo = () => {
    setShowCamera(false);
    setRecording(false);
    video$.delete();
  };

  const phrase = isRenewal
    ? "I certify I am a real human and I reapply to keep being part of this registry"
    : "I certify that I am a real human and that I am not already registered in this registry";

  return (
    <>
      <span className="my-4 flex w-full flex-col text-2xl font-semibold">
        Video
        <div className="divider mt-4 w-2/3" />
      </span>

      <span className="mx-12 my-8 flex flex-col text-center">
        <span>
        Record a short video: hold your phone showing this wallet address (readable, no glare)
        </span>
        <strong className="my-2">{address}</strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">"</code>
          <strong>{phrase}</strong>
          <code className="text-orange">"</code>
        </span>
      </span>

      <span className="mx-12 my-8 flex flex-col text-center">
        <span>
          <strong>
            Upload only in accepted formats (webm, mp4, avi, and mov) to avoid
            losing your deposit
          </strong>
        </span>
      </span>

      {!showCamera && !video && (
        <Checklist
          title="Video Checklist"
          warning="Not following these guidelines will result in a loss of funds."
          items={[
            {
              text: "Show your wallet address & your face in the same frame. Face forward, centered, well lit.",
              isValid: true,
            },
            {
              text: "No filters, background blur, or beauty effects.",
              isValid: false,
            },
            {
              text: "Address must read left→right (not mirrored) and match the connected wallet.",
              isValid: true,
            },
            {
              text: `Say exactly: "${phrase}"`,
              isValid: true,
            },
            {
              text: "No cuts, edits, or music.",
              isValid: false,
            },
            {
              text: "Show wallet address on a phone screen—clear, no shine. If on paper, confirm every character matches.",
              isValid: true,
            },
            {
              text: "Eyes, nose, mouth clearly visible (eyeglasses allowed, given no glare/reflection covering eyes).",
              isValid: true,
            },
          ]}
        />
      )}

      {!showCamera && !video && (
        <div className="mt-6 flex w-full flex-col items-center">
          <button
            className="gradient flex w-full max-w-xl items-center justify-center gap-3 rounded-full px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setShowCamera(true)}
          >
            <CameraIcon className="h-6 w-6 fill-white" />
            <span>Record with camera</span>
          </button>
        </div>
      )}

      {showCamera && (
        <div tabIndex={0} ref={fullscreenRef}>
          <Webcam
            isVideo
            overlay
            recording={recording}
            action={recording ? stopRecording : startRecording}
            fullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            loadCamera={setCamera}
            phrase={phrase}
          />
        </div>
      )}

      {pending && (
        <div className="flex flex-col items-center mt-4">
          <button className="btn-main" disabled>
            <Image
              alt="loading"
              src="/logo/poh-white.svg"
              className="animate-flip"
              height={12}
              width={12}
            />
            {loadingMessage}...
          </button>
        </div>
      )}

      {!!video && !pending && (
        <div className="flex flex-col items-center">
          <video src={video.uri} controls />
          <button className="btn-main mt-4" onClick={advance}>
            Next
          </button>
        </div>
      )}

      {(showCamera || !!video) && !pending && (
        <button
          className="centered text-orange mt-4 text-lg font-semibold uppercase"
          onClick={() => retakeVideo()}
        >
          <ResetIcon className="fill-orange mr-2 h-6 w-6" />
          {showCamera ? "Return" : "Retake"}
        </button>
      )}
    </>
  );
}

export default VideoStep;
