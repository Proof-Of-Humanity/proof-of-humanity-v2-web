import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Uploader from "components/Uploader";
import Webcam from "components/Webcam";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import CameraIcon from "icons/CameraMajor.svg";
import InfoIcon from "icons/info.svg";
import ResetIcon from "icons/ResetMinor.svg";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { toast } from "react-toastify";
import {
  IS_IOS,
  MEDIA_MESSAGES,
  processVideoInput,
  VIDEO_LIMITS,
} from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

interface PhotoProps {
  advance: () => void;
  video$: ObservableObject<MediaState["video"]>;
  isRenewal: boolean;
  videoError: (error: string) => void;
}

const SAMPLE_VIDEO_URL =
  "/api/media/sample-registration-video";

function VideoStep({ advance, video$, isRenewal, videoError }: PhotoProps) {
  const WARNING_TOAST_BASE_MS = 5000;
  const WARNING_TOAST_PER_MESSAGE_MS = 1500;
  const WARNING_TOAST_MAX_MS = 20000;

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
  const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>(
    [],
  );
  const [videoQualityWarnings, setVideoQualityWarnings] = useState<string[]>([]);
  const [rawPreviewUri, setRawPreviewUri] = useState<string | null>(null);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();
  const dedupeMessages = (messages: string[]): string[] =>
    [...new Set(messages.filter(Boolean))];

  const setValidationError = (message: string) => {
    setVideoValidationErrors([message]);
    setVideoQualityWarnings([]);
    videoError(message);
  };

  const setGenericProcessingError = () => {
    setValidationError(MEDIA_MESSAGES.genericVideoProcessingError);
  };

  const showWarningToasts = (messages: string[]) => {
    const warningMessages = [...new Set(messages.filter(Boolean))];
    if (warningMessages.length === 0) return;

    const autoCloseMs = Math.min(
      WARNING_TOAST_MAX_MS,
      WARNING_TOAST_BASE_MS + (warningMessages.length - 1) * WARNING_TOAST_PER_MESSAGE_MS,
    );

    warningMessages.forEach((warningMessage) =>
      toast.warn(warningMessage, {
        autoClose: autoCloseMs,
        pauseOnHover: true,
      }),
    );
  };

  const processVideoBlob = async (blob: Blob) => {
    // Show a raw preview immediately so user sees their video while processing
    const previewUrl = URL.createObjectURL(blob);
    setRawPreviewUri((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    const needsCompression = blob.size > VIDEO_LIMITS.maxSizeBytes;
    if (needsCompression) {
      loading.start("Compressing video");
    }

    const result = await processVideoInput(blob);
    if (cancelledRef.current) {
      URL.revokeObjectURL(previewUrl);
      return;
    }

    if (result.error) {
      const errorMessages = dedupeMessages(
        result.error.messages ?? [result.error.userMessage],
      );
      const warningMessages = dedupeMessages(result.error.warnings ?? []);
      const combinedErrorMessage = errorMessages.join(" ");

      setVideoValidationErrors(errorMessages);
      videoError(combinedErrorMessage);

      if (warningMessages.length > 0) {
        setVideoQualityWarnings(warningMessages);
        showWarningToasts(warningMessages);
      } else {
        setVideoQualityWarnings([]);
      }
      return;
    }

    const processed = result.data;

    setVideoQualityWarnings([]);
    if (processed.warnings.length > 0) {
      const warningMessages = dedupeMessages(processed.warnings);
      setVideoQualityWarnings(warningMessages);
      showWarningToasts(warningMessages);
    }

    setVideoValidationErrors([]);
    URL.revokeObjectURL(previewUrl);
    setRawPreviewUri(null);

    if (video?.uri) URL.revokeObjectURL(video.uri);
    video$.set({
      content: processed.blob,
      uri: URL.createObjectURL(processed.blob),
    });
    setRecording(false);
    setShowCamera(false);

    if (needsCompression && processed.didCompress) {
      toast.success("Video compressed successfully");
    }
  };

  const handleUploadedVideo = async (received: File[]) => {
    const file = received[0];
    if (!file) return;

    setVideoValidationErrors([]);
    setVideoQualityWarnings([]);
    cancelledRef.current = false;
    loading.start("Processing video");

    try {
      await processVideoBlob(file);
    } catch (err: unknown) {
      setGenericProcessingError();
    } finally {
      loading.stop();
    }
  };

  const startRecording = () => {
    if (pending) return;
    if (!camera || !camera.stream) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const [videoTrack] = camera.stream.getVideoTracks();
    if (!videoTrack || videoTrack.readyState !== "live") {
      setValidationError("Camera not ready. Please wait a moment and try again.");
      return;
    }

    const captureFrameRate = videoTrack?.getSettings().frameRate;

    if (
      typeof captureFrameRate === "number" &&
      captureFrameRate < VIDEO_LIMITS.minCaptureFps
    ) {
      const lowFpsError =
        "Your camera is running too slowly right now. Improve lighting, close background apps, and try again.";
      setValidationError(lowFpsError);
      return;
    }

    const preferredMimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    const supportedMimeType = preferredMimeTypes.find(
      (mimeType) =>
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mimeType),
    );

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = supportedMimeType
        ? new MediaRecorder(camera.stream, { mimeType: supportedMimeType })
        : new MediaRecorder(camera.stream);
    } catch (error) {
      setValidationError("Recording is not supported on this browser.");
      return;
    }

    const recordedChunks: BlobPart[] = [];
    let discardRecording = false;
    let handledStop = false;

    mediaRecorder.ondataavailable = ({ data }) => {
      if (discardRecording) return;
      if (!data || data.size === 0) return;

      recordedChunks.push(data);
    };

    mediaRecorder.onstop = async () => {
      if (handledStop) return;
      handledStop = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      setFullscreen(false);
      setRecording(false);

      if (discardRecording) return;

      if (recordedChunks.length === 0) {
        const noDataError = "No video data captured. Please try recording again.";
        setValidationError(noDataError);
        return;
      }

      setVideoValidationErrors([]);
      setVideoQualityWarnings([]);
      cancelledRef.current = false;
      loading.start("Processing video");

      try {
        const blob = new Blob(recordedChunks, {
          type:
            mediaRecorder.mimeType ||
            (recordedChunks[0] instanceof Blob ? recordedChunks[0].type : "") ||
            (IS_IOS ? "video/mp4" : "video/webm"),
        });
        await processVideoBlob(blob);
      } catch (err: unknown) {
        setGenericProcessingError();
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
    setVideoValidationErrors([]);
    setVideoQualityWarnings([]);
    loading.stop();
    if (rawPreviewUri) URL.revokeObjectURL(rawPreviewUri);
    setRawPreviewUri(null);
    if (video?.uri) URL.revokeObjectURL(video.uri);
    video$.delete();
  };

  useEffect(
    () => () => {
      if (rawPreviewUri) URL.revokeObjectURL(rawPreviewUri);
    },
    [rawPreviewUri],
  );

  const phrase = isRenewal
    ? "I certify I am a real human and I reapply to keep being part of this registry"
    : "I certify that I am a real human and that I am not already registered in this registry";

  // ─── Derived visual state ────────────────────────────────────────
  const isPreparing = pending && !rawPreviewUri;
  const isProcessing = pending && !!rawPreviewUri;
  const hasError =
    !pending && !!rawPreviewUri && videoValidationErrors.length > 0;
  const isAccepted = !!video && !pending;
  const isSourceSelection = !showCamera && !video && !pending && !rawPreviewUri;
  const hasIssues =
    videoValidationErrors.length > 0 || videoQualityWarnings.length > 0;

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

      <span className="mx-4 my-8 flex flex-col text-center sm:mx-12">
        <span>
          Record a short video: hold your phone showing this wallet address
          (readable, no glare)
        </span>
        <strong className="my-2 break-all font-mono text-sm sm:text-base">
          {address}
        </strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">&quot;</code>
          <strong>{phrase}</strong>
          <code className="text-orange">&quot;</code>
        </span>
      </span>

      {isSourceSelection && (
        <div className="mx-auto mb-8 w-full max-w-3xl rounded-2xl border border-orange bg-whiteBackground p-4 shadow-sm sm:p-5">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="bg-lightOrange flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange">
              <CameraIcon className="h-5 w-5 fill-orange" />
            </div>
            <div>
              <h3 className="text-primaryText text-lg font-semibold">
                Example Submission
              </h3>
              <p className="text-secondaryText text-sm">
                Watch this example to see how a correct submission looks.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-stroke bg-black shadow-sm">
            <video
              className="aspect-video w-full bg-black object-cover"
              src={SAMPLE_VIDEO_URL}
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      )}

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
          <div
            className="relative inline-block max-w-full overflow-hidden rounded-lg bg-black"
          >
            <video
              src={rawPreviewUri!}
              className="mx-auto max-h-72 w-auto max-w-full object-contain opacity-60 sm:max-h-64"
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
          <Previewed
            isVideo
            uri={video.uri}
            trigger={
              <div
                className="inline-block max-w-full overflow-hidden rounded-lg bg-black"
              >
                <video
                  className="mx-auto max-h-72 w-auto max-w-full cursor-pointer object-contain sm:max-h-64"
                  src={`${video.uri}#t=0.001`}
                  preload="metadata"
                  playsInline
                />
              </div>
            }
          />
          <span className="text-secondaryText mt-1 text-sm">
            Tap video to preview fullscreen
          </span>
          {hasIssues && (
            <div className="border-stroke bg-primaryBackground mt-4 w-full max-w-2xl rounded-xl border px-5 py-4 shadow-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold text-primaryText">
                <span className="border-stroke bg-whiteBackground flex h-7 w-7 items-center justify-center rounded-full border">
                  <InfoIcon className="h-4 w-4 stroke-current stroke-2 text-primaryText" />
                </span>
                <span>Issues Found</span>
              </div>
              {videoQualityWarnings.length > 0 && (
                <div className="mx-auto w-full max-w-lg">
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full bg-status-challenged/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#D98A1F]">
                      Warnings
                    </span>
                  </div>
                  <ul className="flex flex-col items-center gap-2 text-center text-sm text-[#D98A1F]">
                    {videoQualityWarnings.map((warningMessage, idx) => (
                      <li
                        key={`accepted-warning-${idx}`}
                        className="flex items-start justify-center gap-2"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                        <span className="text-[#D98A1F]">{warningMessage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
          <div
            className="inline-block max-w-full overflow-hidden rounded-lg bg-black"
          >
            <video
              src={rawPreviewUri!}
              controls
              className="mx-auto max-h-72 w-auto max-w-full object-contain sm:max-h-64"
            />
          </div>
          <div className="border-stroke bg-primaryBackground mt-4 w-full max-w-2xl rounded-xl border px-5 py-4 shadow-sm">
            <div className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold text-primaryText">
              <span className="border-stroke bg-whiteBackground flex h-7 w-7 items-center justify-center rounded-full border">
                <InfoIcon className="h-4 w-4 stroke-current stroke-2 text-primaryText" />
              </span>
              <span className="text-primaryText">Issues Found</span>
            </div>
            <div className="mx-auto w-full max-w-lg">
              <div className="mb-2 flex justify-center">
                <span className="rounded-full bg-status-rejected/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-status-rejected">
                  Major Issues
                </span>
              </div>
              <ul className="flex flex-col items-center gap-2 text-center text-sm text-primaryText">
                {videoValidationErrors.map((errorMessage, idx) => (
                  <li
                    key={`error-${idx}`}
                    className="flex items-start justify-center gap-2"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    <span className="text-status-rejected">{errorMessage}</span>
                  </li>
                ))}
              </ul>
            </div>
            {videoQualityWarnings.length > 0 && (
              <div className="border-stroke mt-4 border-t pt-4">
                <div className="mb-2 flex justify-center">
                  <span className="rounded-full bg-status-challenged/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#D98A1F]">
                    Warnings
                  </span>
                </div>
                <ul className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 text-center text-sm text-[#D98A1F]">
                  {videoQualityWarnings.map((warningMessage, idx) => (
                    <li
                      key={`warning-${idx}`}
                      className="flex items-start justify-center gap-2"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                      <span className="text-[#D98A1F]">{warningMessage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div >
      )
      }

      {/* ── Bottom action button ── */}
      {
        ((showCamera && !pending) || isAccepted || isProcessing || isPreparing || hasError) && (
          <button
            className="centered text-orange mt-4 text-lg font-semibold uppercase disabled:opacity-50"
            onClick={() => retakeVideo()}
            disabled={recording}
          >
            <ResetIcon className="fill-orange mr-2 h-6 w-6" />
            {(isProcessing || isPreparing)
              ? "Cancel"
              : showCamera
                ? "Return"
                : "Try Again"}
          </button>
        )
      }
    </>
  );
}

export default VideoStep;
