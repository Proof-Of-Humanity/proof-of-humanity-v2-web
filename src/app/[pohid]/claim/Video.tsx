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
import {
  IS_IOS,
  analyzeVideoFrameTiming,
  videoSanitizer,
  detectVideoFormat,
  getVideoMimeType,
} from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

const MAX_DURATION = 20; // Seconds
const MAX_SIZE = 10; // Megabytes
const MAX_SIZE_BYTES = 1024 * 1024 * MAX_SIZE; // Bytes
const MAX_SIZE_ERROR_MSG = `Video is oversized. Maximum allowed size is ${MAX_SIZE}mb`;
const MIN_DIMENSION = 352; // PX
const MIN_CAPTURE_FPS = 20;
const MAX_FRAME_GAP_MS = 220;
const MIN_AVERAGE_BITRATE_SD = 600_000; // bits/s
const MIN_AVERAGE_BITRATE_HD = 1_100_000; // bits/s
const MIN_AVERAGE_BITRATE_FHD = 2_000_000; // bits/s

const readVideoMetadata = (
  blob: Blob,
): Promise<{ duration: number; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(blob);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      cleanup();
      resolve({ duration, width, height });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to read video metadata."));
    };
    video.src = objectUrl;
  });

const getMinAverageBitrate = (width: number, height: number) => {
  const longEdge = Math.max(width, height);

  if (longEdge > 1280) return MIN_AVERAGE_BITRATE_FHD;
  if (longEdge > 854) return MIN_AVERAGE_BITRATE_HD;
  return MIN_AVERAGE_BITRATE_SD;
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
  const [videoValidationError, setVideoValidationError] = useState<
    string | null
  >(null);
  const [videoQualityWarning, setVideoQualityWarning] = useState<string | null>(
    null,
  );

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const startRecording = () => {
    if (!camera || !camera.stream) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const [videoTrack] = camera.stream.getVideoTracks();
    const captureFrameRate = videoTrack?.getSettings().frameRate;

    if (captureFrameRate && captureFrameRate < MIN_CAPTURE_FPS) {
      const lowFpsError =
        "Your camera is running too slowly right now. Improve lighting, close background apps, and try again.";
      videoError(lowFpsError);
      toast.error(lowFpsError);
      return;
    }

    const mediaRecorder = new MediaRecorder(camera.stream, {
      mimeType: IS_IOS ? 'video/mp4;codecs="h264"' : 'video/webm; codecs="vp8"',
    });

    mediaRecorder.ondataavailable = async ({ data }) => {
      setVideoValidationError(null);
      setVideoQualityWarning(null);
      loading.start("Processing video");

      try {
        const blob = new Blob([data], {
          type: IS_IOS ? "video/mp4" : "video/webm",
        });

        const needsCompression = blob.size > MAX_SIZE_BYTES;
        if (needsCompression) {
          loading.start("Compressing video");
        }

        const buffer = await blob.arrayBuffer();
        const sanitized = await videoSanitizer(buffer, MAX_SIZE_BYTES);
        const sanitizedArray = new Uint8Array(sanitized as ArrayBuffer);

        const detectedFormat = detectVideoFormat(sanitizedArray);
        const outputType = getVideoMimeType(detectedFormat);
        const sanitizedBlob = new Blob([sanitizedArray], { type: outputType });
        video$.set({
          content: sanitizedBlob,
          uri: URL.createObjectURL(sanitizedBlob),
        });
        setShowCamera(false);
        const frameTiming = await analyzeVideoFrameTiming(
          sanitizedArray.buffer,
        );
        const { duration, width, height } =
          await readVideoMetadata(sanitizedBlob);
        const shortEdge = Math.min(width, height);
        const averageBitrate =
          duration > 0 ? Math.floor((sanitizedBlob.size * 8) / duration) : 0;
        const minAverageBitrate = getMinAverageBitrate(width, height);

        if (sanitizedBlob.size > MAX_SIZE_BYTES) {
          setVideoValidationError(MAX_SIZE_ERROR_MSG);
          videoError(MAX_SIZE_ERROR_MSG);
          return;
        }

        if (shortEdge < MIN_DIMENSION) {
          const lowResError =
            'Video does\'t meet the minimum resolution requirements.';
          setVideoValidationError(lowResError);
          video$.delete();
          videoError(lowResError);
          toast.error(lowResError);
          return;
        }

        if (
          frameTiming?.effectiveFps &&
          frameTiming.effectiveFps < MIN_CAPTURE_FPS
        ) {
          const lowProcessedFpsError =
            'Video looks choppy to verify clearly. Please improve lighting, close background apps, and record again.';
          setVideoValidationError(lowProcessedFpsError);
          video$.delete();
          videoError(lowProcessedFpsError);
          toast.error(lowProcessedFpsError);
          return;
        }

        if (
          frameTiming?.maxFrameGapMs &&
          frameTiming.maxFrameGapMs > MAX_FRAME_GAP_MS
        ) {
          const frameGapWarning =
            'Video may look choppy.Please verify before submitting.';
          setVideoQualityWarning(frameGapWarning);
          toast.warn(frameGapWarning);
        }

        if (averageBitrate > 0 && averageBitrate < minAverageBitrate) {
          const lowBitrateError =
            'Video quality is too low to verify clearly. Use good lighting and a stable camera, and record in your camera\’s higher quality mode.';
          setVideoValidationError(lowBitrateError);
          video$.delete();
          videoError(lowBitrateError);
          toast.error(lowBitrateError);
          return;
        }

        setVideoValidationError(null);

        if (needsCompression) {
          toast.success("Video compressed successfully");
        }
      } catch (err: any) {
        const processingError = err.message || "Failed to process video";
        setVideoValidationError(processingError);
        toast.error(processingError);
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

    //Auto - stop recording at MAX_DURATION
    timerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.ondataavailable = null; // Discard the recorded data
        mediaRecorder.stop();
        setRecording(false);
        setFullscreen(false);
        toast.error(
          "Upload duration of 20 seconds exceeded. Please record a shorter version.",
        );
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
    setVideoValidationError(null);
    setVideoQualityWarning(null);
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
          Record a short video: hold your phone showing this wallet address
          (readable, no glare)
        </span>
        <strong className="my-2">{address}</strong>
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
        <div className="mt-4 flex flex-col items-center">
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
          {videoQualityWarning && (
            <span className="mt-3 text-center text-sm text-amber-500">
              {videoQualityWarning}
            </span>
          )}
          {videoValidationError && (
            <span className="mt-3 text-center text-sm text-red-500">
              {videoValidationError}
            </span>
          )}
          <button
            className="btn-main mt-4 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={advance}
            disabled={!!videoValidationError}
          >
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
