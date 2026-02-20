import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Uploader from "components/Uploader";
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
  readVideoMetadata,
  VIDEO_LIMITS,
  validateVideoType,
  validateVideoMetadata,
  validateVideoQuality,
} from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";


interface PhotoProps {
  advance: () => void;
  video$: ObservableObject<MediaState["video"]>;
  isRenewal: boolean;
  videoError: (error: string) => void;
}

const GENERIC_VIDEO_PROCESSING_ERROR =
  "Something went wrong while processing the video. Please try again.";
const INVALID_VIDEO_FILE_ERROR =
  "Invalid or corrupted video file. Please upload a valid WEBM, MP4, AVI, or MOV video.";

function VideoStep({ advance, video$, isRenewal, videoError }: PhotoProps) {
  const video = video$.use();

  const { address } = useAccount();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

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
  const [rawPreviewUri, setRawPreviewUri] = useState<string | null>(null);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const setValidationError = (message: string) => {
    setVideoValidationError(message);
    setVideoQualityWarning(null);
    videoError(message);
  };

  const processVideoBlob = async (blob: Blob) => {
    // Show a raw preview immediately so user sees their video while processing
    const previewUrl = URL.createObjectURL(blob);
    setRawPreviewUri(previewUrl);

    // 1. Sanitize via FFmpeg (strips metadata, compresses if needed)
    const needsCompression = blob.size > VIDEO_LIMITS.maxSizeBytes;
    if (needsCompression) {
      loading.start("Compressing video");
    }

    const buffer = await blob.arrayBuffer();
    if (cancelledRef.current) return;

    const sanitized = await videoSanitizer(buffer, VIDEO_LIMITS.maxSizeBytes);
    if (cancelledRef.current) return;

    const sanitizedArray = sanitized;
    const detectedFormat = detectVideoFormat(sanitizedArray);
    if (!detectedFormat) {
      throw new Error(INVALID_VIDEO_FILE_ERROR);
    }
    const outputType = getVideoMimeType(detectedFormat);
    const sanitizedBlob = new Blob([sanitizedArray.slice().buffer], {
      type: outputType,
    });

    // 2. Extract metadata and frame timing
    const [frameTiming, { duration, width, height }] = await Promise.all([
      analyzeVideoFrameTiming(sanitizedArray.buffer),
      readVideoMetadata(sanitizedBlob),
    ]);
    if (cancelledRef.current) return;

    // 3. Validate hard limits (duration, size, dimensions)
    const metaResult = validateVideoMetadata({
      duration,
      width,
      height,
      sizeBytes: sanitizedBlob.size,
    });
    if (!metaResult.ok) {
      setValidationError(metaResult.error);
      return;
    }

    // 4. Validate quality (FPS, frame gaps, bitrate)
    const qualityResult = validateVideoQuality(frameTiming, {
      duration,
      width,
      height,
      sizeBytes: sanitizedBlob.size,
    });
    if (!qualityResult.ok) {
      setValidationError(qualityResult.error);
      return;
    }

    // Final cancel check before committing
    if (cancelledRef.current) return;

    // 5. Apply warnings (non-blocking)
    setVideoQualityWarning(null);
    if (qualityResult.warnings.length > 0) {
      const warning = qualityResult.warnings[0];
      setVideoQualityWarning(warning);
      toast.warn(warning);
    }

    // 6. Accept video
    setVideoValidationError(null);
    URL.revokeObjectURL(previewUrl);
    setRawPreviewUri(null);

    video$.set({
      content: sanitizedBlob,
      uri: URL.createObjectURL(sanitizedBlob),
    });
    setRecording(false);
    setShowCamera(false);

    if (needsCompression) {
      toast.success("Video compressed successfully");
    }
  };

  const handleUploadedVideo = async (received: File[]) => {
    const file = received[0];
    if (!file) return;

    const typeResult = validateVideoType(file.type);
    if (!typeResult.ok) {
      setValidationError(typeResult.error);
      console.error(typeResult.error);
      return;
    }

    // Pre-compression duration check — reject obviously long videos without wasting FFmpeg time
    try {
      const rawMeta = await readVideoMetadata(file);
      if (rawMeta.duration > VIDEO_LIMITS.maxDurationSec) {
        setValidationError(
          `Video is too long (${Math.round(rawMeta.duration)}s). Maximum allowed duration is ${VIDEO_LIMITS.maxDurationSec} seconds.`,
        );
        return;
      }
    } catch {
      // If we can't read metadata pre-check, proceed anyway — FFmpeg will catch issues
    }

    setVideoValidationError(null);
    setVideoQualityWarning(null);
    cancelledRef.current = false;
    loading.start("Processing video");

    try {
      await processVideoBlob(file);
    } catch (err: any) {
      if (err instanceof Error && err.message === INVALID_VIDEO_FILE_ERROR) {
        setValidationError(INVALID_VIDEO_FILE_ERROR);
      } else {
        setValidationError(GENERIC_VIDEO_PROCESSING_ERROR);
      }
      console.error("Video upload processing error:", err);
    } finally {
      loading.stop();
    }
  };

  const startRecording = () => {
    if (!camera || !camera.stream) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const [videoTrack] = camera.stream.getVideoTracks();
    const captureFrameRate = videoTrack?.getSettings().frameRate;

    if (
      typeof captureFrameRate === "number" &&
      captureFrameRate < VIDEO_LIMITS.minCaptureFps
    ) {
      const lowFpsError =
        "Your camera is running too slowly right now. Improve lighting, close background apps, and try again.";
      videoError(lowFpsError);
      return;
    }

    const mediaRecorder = new MediaRecorder(camera.stream, {
      mimeType: IS_IOS ? 'video/mp4;codecs="h264"' : 'video/webm; codecs="vp8"',
      videoBitsPerSecond: VIDEO_LIMITS.recorderVideoBps,
      audioBitsPerSecond: VIDEO_LIMITS.recorderAudioBps,
    });
    const recordedChunks: BlobPart[] = [];
    let discardRecording = false;

    mediaRecorder.ondataavailable = ({ data }) => {
      if (discardRecording) return;
      if (!data || data.size === 0) return;

      recordedChunks.push(data);
    };

    mediaRecorder.onstop = async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFullscreen(false);
      setRecording(false);

      if (discardRecording) return;

      if (recordedChunks.length === 0) {
        const noDataError = "No video data captured. Please try recording again.";
        setValidationError(noDataError);
        return;
      }

      setVideoValidationError(null);
      setVideoQualityWarning(null);
      cancelledRef.current = false;
      loading.start("Processing video");

      try {
        const blob = new Blob(recordedChunks, {
          type: IS_IOS ? "video/mp4" : "video/webm",
        });
        await processVideoBlob(blob);
      } catch (err: any) {
        if (err instanceof Error && err.message === INVALID_VIDEO_FILE_ERROR) {
          setValidationError(INVALID_VIDEO_FILE_ERROR);
        } else {
          setValidationError(GENERIC_VIDEO_PROCESSING_ERROR);
        }
        console.error("Video sanitization error:", err);
      } finally {
        loading.stop();
      }
    };

    mediaRecorder.start();

    setRecorder(mediaRecorder);
    setRecording(true);

    //Auto - stop recording at MAX_DURATION
    timerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        discardRecording = true;
        recordedChunks.length = 0;
        mediaRecorder.stop();
        setRecording(false);
        setFullscreen(false);
        toast.error(
          "Upload duration of 20 seconds exceeded. Please record a shorter version.",
        );
      }
    }, VIDEO_LIMITS.maxDurationSec * 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!recorder || !recording) return;
    recorder.stop();
  };

  const retakeVideo = () => {
    // Signal any in-flight processing to bail out
    cancelledRef.current = true;

    setShowCamera(false);
    setRecording(false);
    setVideoValidationError(null);
    setVideoQualityWarning(null);
    loading.stop();
    if (rawPreviewUri) URL.revokeObjectURL(rawPreviewUri);
    setRawPreviewUri(null);
    video$.delete();
  };

  const phrase = isRenewal
    ? "I certify I am a real human and I reapply to keep being part of this registry"
    : "I certify that I am a real human and that I am not already registered in this registry";

  // ─── Derived visual state ────────────────────────────────────────
  const isPreparing = pending && !rawPreviewUri;
  const isProcessing = pending && !!rawPreviewUri;
  const hasError = !pending && !!rawPreviewUri && !!videoValidationError;
  const isAccepted = !!video && !pending;
  const isSourceSelection = !showCamera && !video && !pending && !rawPreviewUri;

  const checklistItems = [
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
  ];

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
          <code className="text-orange">&quot;</code>
          <strong>{phrase}</strong>
          <code className="text-orange">&quot;</code>
        </span>
      </span>

      {/* ── S1: Source Selection ── */}
      {isSourceSelection && (
        <>
          <Checklist
            title="Video Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={checklistItems}
          />

          <div className="mt-6 flex w-full flex-col items-center">
            <button
              className="gradient flex w-full max-w-xl items-center justify-center gap-3 rounded-full px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => setShowCamera(true)}
            >
              <CameraIcon className="h-6 w-6 fill-white" />
              <span>Record with Camera (Recommended)</span>
            </button>

            <span className="mt-2 text-sm font-semibold text-primaryText">OR</span>

            <Uploader
              className="mt-1 text-base font-semibold text-primary underline underline-offset-2 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              type="video"
              onDrop={handleUploadedVideo}
            >
              <span>Upload video</span>
            </Uploader>
          </div>
        </>
      )}

      {/* ── S2: Camera Live ── */}
      {showCamera && !pending && (
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
            items={checklistItems}
          />
        </>
      )}

      {/* ── S3: Processing ── */}
      {isPreparing && (
        <div className="mt-4 flex flex-col items-center">
          <button className="btn-main" disabled>
            <Image
              alt="loading"
              src="/logo/poh-white.svg"
              className="animate-flip"
              height={12}
              width={12}
            />
            {loadingMessage || "Processing video"}...
          </button>
        </div>
      )}

      {/* ── S3: Processing with raw preview ── */}
      {isProcessing && (
        <div className="mt-4 flex flex-col items-center">
          <div className="relative w-full max-w-xl">
            <video
              src={rawPreviewUri!}
              className="w-full rounded-lg opacity-60"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/40">
              <Image
                alt="loading"
                src="/logo/poh-white.svg"
                className="animate-flip"
                height={24}
                width={24}
              />
              <span className="mt-2 text-sm font-semibold text-white">
                {loadingMessage}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── S4/S5: Accepted (± warning) ── */}
      {isAccepted && (
        <div className="flex flex-col items-center">
          <video src={video.uri} controls className="w-full max-w-xl rounded-lg" />
          {videoQualityWarning && (
            <span className="mt-3 text-center text-sm text-amber-500">
              {videoQualityWarning}
            </span>
          )}
          <button
            className="btn-main mt-4"
            onClick={advance}
          >
            Next
          </button>
        </div>
      )}

      {/* ── S6: Error with preview ── */}
      {hasError && (
        <div className="flex flex-col items-center">
          <video src={rawPreviewUri!} controls className="w-full max-w-xl rounded-lg" />
          <span className="mt-3 text-center text-sm text-red-500">
            {videoValidationError}
          </span>
        </div>
      )}

      {/* ── Bottom action button ── */}
      {((showCamera && !pending) || isAccepted || isProcessing || isPreparing || hasError) && (
        <button
          className="centered text-orange mt-4 text-lg font-semibold uppercase disabled:opacity-50"
          onClick={() => retakeVideo()}
          disabled={recording}
        >
          <ResetIcon className="fill-orange mr-2 h-6 w-6" />
          {(isProcessing || isPreparing) ? "Cancel" : showCamera ? "Return" : "Retake"}
        </button>
      )}
    </>
  );
}

export default VideoStep;
