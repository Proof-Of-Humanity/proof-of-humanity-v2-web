import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Webcam from "components/Webcam";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import CameraIcon from "icons/CameraMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import Image from "next/image";
import React, { useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { toast } from "react-toastify";
import { videoSanitizer, detectVideoFormat, getVideoMimeType } from "utils/media";
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [recording, setRecording] = useState(false);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const startRecording = () => {
    if (!camera || !camera.stream) return;

    const videoTrack = camera.stream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') {
      toast.error("Camera not ready. Please wait a moment and try again.");
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    const getSupportedMimeType = () => {
      const types = [
        'video/webm;codecs="vp9,opus"',
        'video/webm;codecs="vp8,opus"',
        'video/webm;codecs="vp8"',
        'video/webm',
        'video/mp4;codecs="h264,aac"',
        'video/mp4;codecs="h264"',
        'video/mp4',
      ];
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
      }
      return undefined;
    };

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(camera.stream, mimeType ? { mimeType } : undefined);

    mediaRecorder.ondataavailable = async ({ data }) => {
      loading.start("Processing video");

      try {
        const newlyRecorded = ([] as BlobPart[]).concat(data);
        const blob = new Blob(newlyRecorded, {
          type: mediaRecorder.mimeType || 'video/webm',
        });

        const needsCompression = MAX_SIZE_BYTES && blob.size > MAX_SIZE_BYTES;
        if (needsCompression) {
          loading.start("Compressing video");
        }

        const buffer = await blob.arrayBuffer();
        const sanitized = await videoSanitizer(buffer, MAX_SIZE_BYTES);
        const sanitizedArray = new Uint8Array(sanitized as ArrayBuffer);
        
        const detectedFormat = detectVideoFormat(sanitizedArray);
        const outputType = getVideoMimeType(detectedFormat);
        const sanitizedBlob = new Blob([sanitizedArray], { type: outputType });

        if (MAX_SIZE_BYTES && sanitizedBlob.size > MAX_SIZE_BYTES) {
          videoError(ERROR_MSG.size);
          console.error(ERROR_MSG.size);
          return;
        }

        video$.set({ content: sanitizedBlob, uri: URL.createObjectURL(sanitizedBlob) });
        setShowCamera(false);
        
        if (needsCompression) {
          toast.success("Video compressed successfully");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to process video");
        console.error("Video sanitization error:", err);
      } finally {
        loading.stop();
      }
    };

    mediaRecorder.onstop = async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFullscreen(false);
      setRecording(false);
    };

    mediaRecorder.start();

    setRecorder(mediaRecorder);
    setRecording(true);
    
    // Auto-stop recording at MAX_DURATION
    timerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.ondataavailable = null; // Discard the recorded data
        mediaRecorder.stop();
        setRecording(false);
        setFullscreen(false);
        toast.error("Upload duration of 20 seconds exceeded. Please record a shorter version.");
      }
    }, MAX_DURATION * 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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

      <span className="mx-4 sm:mx-12 my-8 flex flex-col text-center">
        <span>
        Record a short video: hold your phone showing this wallet address (readable, no glare)
        </span>
        <strong className="my-2 break-all text-sm sm:text-base font-mono">{address}</strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">"</code>
          <strong>{phrase}</strong>
          <code className="text-orange">"</code>
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
              text: "Address must read left→right (not mirrored) and match the connected wallet.",
              isValid: true,
            },
            {
              text: `Say exactly: "${phrase}"`,
              isValid: true,
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
        <>
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
          <Checklist
            title="Video Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={[
              {
                text: "Show your wallet address & your face in the same frame. Face forward, centered, well lit.",
                isValid: true,
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
                text: "Show wallet address on a phone screen—clear, no shine. If on paper, confirm every character matches.",
                isValid: true,
              },
              {
                text: "Eyes, nose, mouth clearly visible (eyeglasses allowed, given no glare/reflection covering eyes).",
                isValid: true,
              },
            ]}
          />
        </>
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
